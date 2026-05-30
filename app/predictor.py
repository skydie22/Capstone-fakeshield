import os
import re
import pickle
import zipfile
import logging
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import tokenizer_from_json
from tensorflow.keras.preprocessing.sequence import pad_sequences
from .schemas import PredictionOutput, SuspiciousWord

logger = logging.getLogger(__name__)


@tf.keras.utils.register_keras_serializable()
class BahdanauAttention(tf.keras.layers.Layer):
    def __init__(self, units, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.W = tf.keras.layers.Dense(units, use_bias=False)
        self.V = tf.keras.layers.Dense(1, use_bias=False)

    def call(self, inputs):
        score            = tf.nn.tanh(self.W(inputs))
        weights          = tf.nn.softmax(self.V(score), axis=1)
        weights_squeezed = tf.squeeze(weights, -1)
        context          = tf.reduce_sum(weights * inputs, axis=1)
        return context, weights_squeezed

    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units})
        return config


def preprocess_text(text: str) -> str:
    if not isinstance(text, str) or len(text.strip()) == 0:
        return ''
    text = text.lower()
    text = re.sub(r'http\S+|www\.\S+', ' ', text)
    text = re.sub(r'[@#]\w+', ' ', text)
    text = re.sub(r'\b(kompas|detik|tribun|tempo|antara|liputan|cnnindonesia)\.\w*\b', ' ', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_numeric_features(text: str) -> np.ndarray:
    """
    4 fitur numerik sesuai training notebook:
      [0] rasio_kapital = (jumlah huruf kapital / total karakter) * 100
      [1] jml_seru      = jumlah tanda '!'
      [2] jml_tanya     = jumlah tanda '?'
      [3] jumlah_kata   = jumlah kata dari teks ASLI (sebelum preprocessing)
    """
    total_chars   = len(text) if len(text) > 0 else 1
    upper_chars   = sum(1 for c in text if c.isupper())
    rasio_kapital = (upper_chars / total_chars) * 100
    jml_seru      = text.count('!')
    jml_tanya     = text.count('?')
    jumlah_kata   = len(text.split())
    return np.array([[rasio_kapital, jml_seru, jml_tanya, jumlah_kata]], dtype=np.float32)


def _find_model_file(base: str) -> str:
    """Cari folder/file model .keras secara otomatis di folder models/"""
    for name in os.listdir(base):
        full = os.path.join(base, name)
        if name.endswith('.keras') and (os.path.isdir(full) or os.path.isfile(full)):
            return full
    raise FileNotFoundError(f"Tidak ada file .keras di folder: {base}")


def _find_file(base: str, ext: str) -> str:
    """Cari file berdasarkan ekstensi secara otomatis di folder models/"""
    for name in os.listdir(base):
        if name.endswith(ext):
            return os.path.join(base, name)
    raise FileNotFoundError(f"Tidak ada file {ext} di folder: {base}")


class Predictor:
    def __init__(self):
        base                = os.path.join(os.path.dirname(__file__), '..', 'models')
        self.model_path     = _find_model_file(base)
        self.tokenizer_path = _find_file(base, '.json')
        self.scaler_path    = _find_file(base, '.pkl')
        self.model          = None
        self.tokenizer      = None
        self.scaler         = None
        self.max_len        = 120
        logger.info('Model path    : %s', self.model_path)
        logger.info('Tokenizer path: %s', self.tokenizer_path)
        logger.info('Scaler path   : %s', self.scaler_path)

    def _load_model(self):
        if self.model is not None:
            return
        try:
            if os.path.isdir(self.model_path):
                tmp_zip = self.model_path + '_tmp.keras'
                with zipfile.ZipFile(tmp_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
                    for fname in ['config.json', 'metadata.json', 'model.weights.h5']:
                        fpath = os.path.join(self.model_path, fname)
                        if os.path.exists(fpath):
                            zf.write(fpath, fname)
                load_path = tmp_zip
            else:
                load_path = self.model_path

            self.model = tf.keras.models.load_model(
                load_path,
                custom_objects={'BahdanauAttention': BahdanauAttention}
            )

            if os.path.exists(load_path) and load_path.endswith('_tmp.keras'):
                os.remove(load_path)

            logger.info('✅ Model loaded: %s', self.model_path)
        except Exception as e:
            logger.error('Gagal load model: %s', str(e))
            self.model = None
            raise

    def _load_tokenizer(self):
        if self.tokenizer is not None:
            return
        try:
            with open(self.tokenizer_path, 'r', encoding='utf-8') as f:
                self.tokenizer = tokenizer_from_json(f.read())
            logger.info('✅ Tokenizer loaded | vocab: %d kata', len(self.tokenizer.word_index))
        except Exception as e:
            logger.error('Gagal load tokenizer: %s', str(e))
            self.tokenizer = None
            raise

    def _load_scaler(self):
        if self.scaler is not None:
            return
        try:
            with open(self.scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            logger.info('✅ Scaler loaded | fitur: %d', self.scaler.n_features_in_)
        except Exception as e:
            logger.error('Gagal load scaler: %s', str(e))
            self.scaler = None
            raise

    def predict(self, text: str) -> PredictionOutput:
        self._load_model()
        self._load_tokenizer()
        self._load_scaler()

        # --- Input 1: teks ---
        clean_text = preprocess_text(text)
        logger.info('Original: %s', text[:100])
        logger.info('Cleaned : %s', clean_text[:100])

        sequences = self.tokenizer.texts_to_sequences([clean_text])
        padded    = pad_sequences(
            sequences, maxlen=self.max_len, padding='post', truncating='post'
        ).astype('int32')

        # --- Input 2: fitur numerik dari teks ASLI ---
        numeric_raw    = extract_numeric_features(text)
        numeric_scaled = self.scaler.transform(numeric_raw).astype(np.float32)
        logger.info('Numeric raw : rasio_kapital=%.2f | seru=%d | tanya=%d | kata=%d',
                    numeric_raw[0][0], int(numeric_raw[0][1]),
                    int(numeric_raw[0][2]), int(numeric_raw[0][3]))

        # --- Predict ---
        outputs = self.model.predict([padded, numeric_scaled], verbose=0)

        if isinstance(outputs, (list, tuple)) and len(outputs) == 2:
            confidence_raw = float(outputs[0][0][0])
            attn_vec       = outputs[1][0]
        else:
            confidence_raw = float(np.squeeze(outputs))
            attn_vec       = np.ones(self.max_len) / self.max_len

        # --- Label & level ---
        is_hoaks   = confidence_raw >= 0.5
        label      = 'hoaks' if is_hoaks else 'bukan_hoaks'
        confidence = confidence_raw if is_hoaks else (1.0 - confidence_raw)

        if is_hoaks:
            if confidence >= 0.90:   level, color = 'Sangat Terindikasi Hoaks', 'red'
            elif confidence >= 0.70: level, color = 'Terindikasi Hoaks',        'orange'
            else:                    level, color = 'Perlu Verifikasi',          'yellow'
        else:
            if confidence >= 0.90:   level, color = 'Sangat Valid',             'green'
            elif confidence >= 0.70: level, color = 'Kemungkinan Valid',         'green'
            else:                    level, color = 'Perlu Verifikasi',          'yellow'

        # --- Attention per kata ---
        words     = clean_text.split()
        n         = min(len(words), self.max_len)
        word_attn = {}
        for i in range(n):
            w            = words[i]
            word_attn[w] = word_attn.get(w, 0) + float(attn_vec[i])

        if word_attn:
            max_s = max(word_attn.values())
            if max_s > 0:
                word_attn = {k: round(v / max_s, 4) for k, v in word_attn.items()}

        top5                 = sorted(word_attn.items(), key=lambda x: x[1], reverse=True)[:5]
        top_suspicious_words = [SuspiciousWord(word=w, attention_score=s) for w, s in top5]

        logger.info('PREDICT | label=%s | confidence_raw=%.4f | confidence=%.4f | level=%s',
                    label, confidence_raw, confidence, level)

        return PredictionOutput(
            label=label,
            confidence=round(confidence, 4),
            confidence_raw=round(confidence_raw, 4),
            confidence_level=level,
            confidence_color=color,
            top_suspicious_words=top_suspicious_words,
            attention_per_word=word_attn
        )


_predictor_instance = None

def get_predictor() -> Predictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = Predictor()
    return _predictor_instance
