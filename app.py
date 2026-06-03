# -*- coding: utf-8 -*-
"""FakeShield — Sistem Deteksi Berita Hoaks Berbahasa Indonesia"""
import os
os.environ["KERAS_BACKEND"] = "tensorflow"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import re, json, warnings, h5py
import numpy as np, pandas as pd
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import keras, tensorflow as tf, pickle
from sklearn.feature_extraction.text import TfidfVectorizer

warnings.filterwarnings("ignore")

# ─── BahdanauAttention ────────────────────────────────────────────────────────
@keras.utils.register_keras_serializable()
class BahdanauAttention(keras.layers.Layer):
    def __init__(self, units, **kwargs):
        super().__init__(**kwargs)
        self.units = units

    def build(self, input_shape):
        d = input_shape[-1]
        self.W = self.add_weight(name="W", shape=(d, self.units), initializer="glorot_uniform")
        self.V = self.add_weight(name="V", shape=(self.units, 1), initializer="glorot_uniform")
        super().build(input_shape)

    def call(self, inputs):
        score = tf.nn.tanh(tf.tensordot(inputs, self.W, axes=[[2], [0]]))
        score = tf.tensordot(score, self.V, axes=[[2], [0]])
        weights = tf.nn.softmax(score, axis=1)
        context = tf.reduce_sum(inputs * weights, axis=1)
        return context, weights

    def get_config(self):
        return {**super().get_config(), "units": self.units}

# ─── Page Config ──────────────────────────────────────────────────────────────
st.set_page_config(page_title="FakeShield", layout="wide", initial_sidebar_state="expanded")

C_HOAKS = "#E63946"; C_VALID = "#2A9D8F"; C_DARK = "#1D3557"; C_MID = "#457B9D"

def section(t,s=""):
    st.markdown(f"<div class='section-header'><p class='section-title'>{t}</p><p class='section-sub'>{s}</p></div>",unsafe_allow_html=True)

PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="'IBM Plex Sans', sans-serif", color=C_DARK),
    margin=dict(l=24, r=24, t=56, b=32), title_x=0.5,
    title_font=dict(size=16, color=C_DARK),
)

# ─── CSS ──────────────────────────────────────────────────────────────────────
st.markdown("""<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,300;9..144,700;9..144,900&display=swap');

:root {
    --hoaks:#E63946; --valid:#2A9D8F; --accent:#F4A261; --bg:#F0F4F8;
    --dark:#1D3557; --mid:#457B9D; --light:#A8DADC;
    --card-bg:#FFFFFF; --border:#E2E8F0; --muted:#64748B;
}
html,body,[class*="css"]{ font-family:'IBM Plex Sans',sans-serif; background-color:#F0F4F8!important; color:#1D3557!important; }
[data-testid="stAppViewContainer"]>.main,[data-testid="stAppViewContainer"]{ background:#F0F4F8; }
.block-container{ padding:2rem 2.5rem 3rem; max-width:1400px; }
footer{ display:none; }

[data-testid="stSidebar"]{ background:#1D3557; border-right:1px solid rgba(255,255,255,0.08); }
[data-testid="stSidebar"] *{ color:rgba(255,255,255,0.90)!important; }
[data-testid="stSidebar"] .stRadio label{ font-size:0.88rem; padding:6px 0; }
[data-testid="stSidebar"] hr{ border-color:rgba(255,255,255,0.12); }

.hero-banner{ background:linear-gradient(135deg,#1D3557 0%,#457B9D 60%,#2A9D8F 100%); border-radius:16px; padding:2.5rem 3rem; margin-bottom:2rem; position:relative; overflow:hidden; }
.hero-banner *{ color:#ffffff!important; }
.hero-banner::before{ content:''; position:absolute; inset:0; background:rgba(255,255,255,0.03); }
.hero-title{ font-family:'Fraunces',serif; font-size:2.6rem; font-weight:900; color:#ffffff!important; letter-spacing:-0.03em; line-height:1.1; margin:0; }
.hero-sub{ font-size:0.95rem; font-weight:300; color:rgba(255,255,255,0.85)!important; margin-top:0.6rem; }
.hero-badge{ display:inline-block; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:99px; padding:4px 12px; margin-bottom:0.8rem; color:#fff!important; font-size:0.75rem; font-weight:500; text-transform:uppercase; letter-spacing:0.06em; }

.metric-row{ display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem; }
.metric-card{ flex:1; min-width:160px; position:relative; overflow:hidden; background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:1.25rem 1.5rem; }
.metric-card::before{ content:''; position:absolute; top:0; left:0; width:4px; height:100%; }
.metric-card.hoaks::before{ background:#E63946; }
.metric-card.valid::before{ background:#2A9D8F; }
.metric-card.total::before{ background:#457B9D; }
.metric-card.accent::before{ background:#F4A261; }
.metric-label{ font-size:0.72rem; color:#64748B; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.3rem; }
.metric-value{ font-family:'Fraunces',serif; font-size:2.2rem; font-weight:900; line-height:1; color:#1D3557; }
.metric-sub{ font-size:0.78rem; color:#64748B; margin-top:0.3rem; }

.section-header{ border-left:4px solid #457B9D; padding-left:0.9rem; margin:2rem 0 1rem; }
.section-title{ font-family:'Fraunces',serif; font-size:1.4rem; font-weight:700; color:#1D3557; margin:0; }
.section-sub{ font-size:0.83rem; color:#64748B; margin-top:0.2rem; }

.insight-box{ position:relative; background:linear-gradient(135deg,rgba(29,53,87,0.05),rgba(69,123,157,0.08)); border:1px solid rgba(69,123,157,0.25); border-radius:10px; padding:1.2rem 1.5rem; margin:1rem 0 1.5rem; }
.insight-box::before{ position:absolute; top:1rem; right:1rem; font-size:1.1rem; }
.insight-title{ font-size:0.75rem; font-weight:600; color:#457B9D; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.5rem; }
.insight-text{ font-size:0.88rem; line-height:1.65; color:#1D3557; margin:0; }
.insight-text strong{ color:#E63946; }
.insight-text em{ color:#2A9D8F; font-style:normal; font-weight:600; }

.result-panel{ position:relative; text-align:center; border-radius:14px; padding:2rem; }
.result-panel.hoaks{ background:linear-gradient(135deg,#fff5f5,#ffe8e8); border:2px solid #E63946; }
.result-panel.valid{ background:linear-gradient(135deg,#f0faf8,#e0f5f2); border:2px solid #2A9D8F; }
.result-label{ font-family:'Fraunces',serif; font-size:3rem; font-weight:900; margin:0.5rem 0; }
.result-label.hoaks{ color:#E63946; }
.result-label.valid{ color:#2A9D8F; }

.perf-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin-bottom:1.5rem; }
.perf-cell{ text-align:center; background:#ffffff; border:1px solid #E2E8F0; border-radius:10px; padding:1.2rem 1.4rem; }
.perf-cell-label{ font-size:0.75rem; color:#64748B; text-transform:uppercase; letter-spacing:0.07em; }
.perf-cell-value{ font-family:'Fraunces',serif; font-size:2.4rem; font-weight:900; color:#1D3557; margin:0.2rem 0; }
.perf-cell-value.green{ color:#2A9D8F; }

.config-table{ width:100%; border-collapse:collapse; font-size:0.84rem; }
.config-table th{ background:rgba(29,53,87,0.06); padding:8px 12px; text-align:left; color:#457B9D; font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.07em; }
.config-table td{ padding:9px 12px; color:#1D3557; border-bottom:1px solid #E2E8F0; }
.config-table tr:last-child td{ border-bottom:none; }
.badge-mono{ font-family:'IBM Plex Mono',monospace; background:rgba(69,123,157,0.10); padding:2px 8px; border-radius:4px; font-size:0.8rem; color:#457B9D; }

.nav-title{ font-family:'Fraunces',serif; font-size:1.3rem; font-weight:700; color:#fff; margin-bottom:0.3rem; }
.nav-version{ color:rgba(255,255,255,0.45); font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; }

.stSpinner>div{ color:#457B9D!important; }
div[data-testid="stHorizontalBlock"]{ gap:1rem; }

/* ── Mobile Responsive ── */
@media (max-width: 768px) {
    .block-container{ padding:1rem 1rem 2rem!important; }
    .hero-banner{ padding:1.5rem 1.2rem; border-radius:12px; }
    .hero-title{ font-size:1.8rem!important; }
    .hero-sub{ font-size:0.85rem!important; }
    .metric-row{ gap:0.6rem; }
    .metric-card{ min-width:130px; padding:0.9rem 1rem; }
    .metric-value{ font-size:1.7rem; }
    .metric-label{ font-size:0.68rem; }
    .metric-sub{ font-size:0.72rem; }
    .section-title{ font-size:1.1rem!important; }
    .result-label{ font-size:2.2rem!important; }
    .perf-grid{ grid-template-columns:1fr 1fr; gap:0.6rem; }
    .perf-cell-value{ font-size:1.8rem; }
    [data-testid="stSidebar"]{ min-width:220px!important; }
    div[data-testid="stHorizontalBlock"]{ flex-wrap:wrap!important; }
    div[data-testid="stHorizontalBlock"]>div{ min-width:100%!important; }
}
@media (max-width: 480px) {
    .hero-title{ font-size:1.5rem!important; }
    .metric-card{ min-width:100%; }
    .perf-grid{ grid-template-columns:1fr; }
    .result-label{ font-size:1.9rem!important; }
}
</style>""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# DATA LOADING
# ══════════════════════════════════════════════════════════════════════════════

@st.cache_data(show_spinner=False)
def load_dataset():
    candidates = [
        "dataset_fakeshield_FINAL_ENGINEERED 39K.csv",
        "data/dataset_fakeshield_FINAL_ENGINEERED 39K.csv",
    ]
    for p in candidates:
        if os.path.exists(p):
            df = pd.read_csv(p)
            df["label_str"] = df["label"].map({0: "Valid", 1: "Hoaks"})
            return df
    return None

@st.cache_data(show_spinner=False)
def preprocess_dataset(df):
    CATEGORIES = {
        "Politik & Pemerintahan": ["pemilu","pilkada","kpu","bawaslu","partai","presiden","anggota dpr","gubernur","bupati","walikota","politik","pemerintah","menteri","legislatif","dprd"],
        "Kesehatan": ["covid","vaksin","virus","penyakit","kesehatan","rumah sakit","dokter","obat","bpjs","pandemi","wabah"],
        "Ekonomi & Keuangan": ["rupiah","ekonomi","bisnis","bank","investasi","saham","pajak","subsidi","harga","inflasi","umkm","bantuan","bpnt","bansos","keuangan","modal"],
        "Bencana & Lingkungan": ["bencana","gempa","banjir","tsunami","longsor","kebakaran","cuaca","iklim","lingkungan","polusi"],
        "Teknologi": ["teknologi","internet","media sosial","ai","digital","aplikasi","hacker","siber","data","komputasi"],
        "Kriminal & Hukum": ["kriminal","polisi","hukum","penjara","korupsi","narkoba","teror","penangkapan","kejahatan","mahkamah"],
        "Pendidikan": ["pendidikan","sekolah","universitas","kampus","siswa","mahasiswa","guru","beasiswa","kurikulum"],
        "Agama": ["agama","islam","kristen","hindu","budha","masjid","gereja","ibadah","ulama","rohani"],
    }
    def classify_category(judul):
        j = str(judul).lower()
        for cat, kws in CATEGORIES.items():
            if any(k in j for k in kws): return cat
        return "Sosial & Lainnya"

    df = df.copy()
    df["kategori"] = df["judul"].apply(classify_category)

    months_id = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
    month_num = {m: i+1 for i, m in enumerate(months_id)}
    date_pat  = r"\b(\d{1,2})\s+(" + "|".join(months_id) + r")\s+(\d{4})\b"

    def extract_date(row):
        text = str(row["teks_nlp_final"]) + " " + str(row["judul"])
        m = re.search(date_pat, text)
        if m:
            day, mstr, year = m.groups()
            yr = int(year)
            if 2024 <= yr <= 2026:
                return pd.Timestamp(yr, month_num[mstr], int(day))
        return pd.NaT

    df["tanggal"] = df.apply(extract_date, axis=1)
    return df

@st.cache_data(show_spinner=False)
def compute_tfidf(df):
    STOPWORDS_ID = set(["yang","dan","di","ini","itu","dengan","untuk","dari","ke","pada","dalam","adalah","akan","juga","ada","tidak","saya","kami","kita","mereka","oleh","atau","karena","tetapi","jika","sudah","telah","bisa","bagi","agar","atas","setelah","pun","maka","namun","lebih","sangat","hanya","serta","seperti","belum","lagi","sedang","masih","antara","dapat","hingga","saat","tahun","sejak","tentang","sebuah","kepada","bahwa","ketika","secara","hal","pihak","pula","dua","tiga","satu","lima","enam","tujuh","delapan","semua","setiap","para","maupun","paling","lain","tersebut","terus","mulai","kembali","kini","ia","anda","apa","bagaimana","mengapa","siapa","dimana","kapan","mana","arsip","archive","foto","gambar","screenshot","link","url","video","bulan","hari","tanggal","waktu","menjadi","sebagai","tengah","banyak","beberapa"])
    corpus_h = df[df["label"] == 1]["teks_nlp_final"].dropna().tolist()
    corpus_v = df[df["label"] == 0]["teks_nlp_final"].dropna().tolist()
    tfidf = TfidfVectorizer(max_features=5000, stop_words=list(STOPWORDS_ID), ngram_range=(1,2), min_df=10, sublinear_tf=True)
    tfidf.fit(corpus_h + corpus_v)
    vocab  = tfidf.get_feature_names_out()
    mat_h  = tfidf.transform(corpus_h); mat_v = tfidf.transform(corpus_v)
    mean_h = np.asarray(mat_h.mean(axis=0)).flatten()
    mean_v = np.asarray(mat_v.mean(axis=0)).flatten()
    tdf = pd.DataFrame({"kata": vocab, "hoaks": mean_h, "valid": mean_v})
    tdf["diff_hoaks"] = tdf["hoaks"] - tdf["valid"]
    tdf["diff_valid"] = tdf["valid"] - tdf["hoaks"]
    return tdf, STOPWORDS_ID

@st.cache_data(show_spinner=False)
def get_trend(df):
    df_dated = df[df["tanggal"].notna()].copy()
    df_dated["bulan"] = df_dated["tanggal"].dt.to_period("M")
    trend = df_dated.groupby(["bulan","label_str"]).size().unstack(fill_value=0).reset_index()
    trend["bulan_dt"] = trend["bulan"].dt.to_timestamp()
    trend["total"]    = trend.get("Hoaks", 0) + trend.get("Valid", 0)
    trend = trend.sort_values("bulan_dt")
    if "Hoaks" in trend.columns:
        trend["hoaks_roll3"] = trend["Hoaks"].rolling(3, min_periods=1, center=True).mean()
    return trend

# ─── Model loading ─────────────────────────────────────────────────────────────

def _load_weights_from_keras3_h5(model, h5_path):
    LAYER_MAP = {
        "embedding": "embedding", "bilstm": "bidirectional",
        "bahdanau_attention": "bahdanau_attention", "text_dense": "dense",
        "num_dense1": "dense_1", "num_dense2": "dense_2",
        "combined_dense": "dense_3", "output_pred": "dense_4",
    }
    with h5py.File(h5_path, "r") as hf:
        lg = hf["layers"]
        for model_name, h5_name in LAYER_MAP.items():
            if h5_name not in lg: continue
            grp   = lg[h5_name]
            layer = model.get_layer(model_name)
            if model_name == "embedding":
                layer.set_weights([np.array(grp["vars"]["0"])])
            elif model_name == "bilstm":
                fk  = np.array(grp["forward_layer"]["cell"]["vars"]["0"])
                frk = np.array(grp["forward_layer"]["cell"]["vars"]["1"])
                fb  = np.array(grp["forward_layer"]["cell"]["vars"]["2"])
                bk  = np.array(grp["backward_layer"]["cell"]["vars"]["0"])
                brk = np.array(grp["backward_layer"]["cell"]["vars"]["1"])
                bb  = np.array(grp["backward_layer"]["cell"]["vars"]["2"])
                layer.set_weights([fk, frk, fb, bk, brk, bb])
            elif model_name == "bahdanau_attention":
                layer.set_weights([np.array(grp["W"]["vars"]["0"]), np.array(grp["V"]["vars"]["0"])])
            else:
                layer.set_weights([np.array(grp["vars"]["0"]), np.array(grp["vars"]["1"])])

@st.cache_resource(show_spinner=False)
def load_model_artifacts():
    base_dirs = ["models", os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")]
    result = {"model": None, "tokenizer": None, "scaler": None, "config": {}, "metadata": {}, "model_error": None}

    for base in base_dirs:
        if not os.path.isdir(base): continue

        for fname, key in [("config.json","config"), ("metadata.json","metadata")]:
            p = os.path.join(base, fname)
            if os.path.exists(p):
                with open(p) as f: result[key] = json.load(f)

        for tok_name in ["tokenizer (6).json", "tokenizer.json"]:
            p = os.path.join(base, tok_name)
            if os.path.exists(p):
                with open(p) as f: tok_json = f.read()
                try:
                    from tf_keras.preprocessing.text import tokenizer_from_json as _tfn
                except ImportError:
                    _tfn = tf.keras.preprocessing.text.tokenizer_from_json
                result["tokenizer"] = _tfn(tok_json); break

        for scl_name in ["scaler (3).pkl", "scaler.pkl"]:
            p = os.path.join(base, scl_name)
            if os.path.exists(p):
                with open(p, "rb") as f: result["scaler"] = pickle.load(f); break

        wpath = None
        # Cari 1: model.weights.h5 langsung di folder models/
        direct = os.path.join(base, "model.weights.h5")
        if os.path.exists(direct):
            wpath = direct
        # Cari 2: di dalam subfolder .keras (jika .keras adalah folder)
        if not wpath:
            for entry in os.listdir(base):
                ep = os.path.join(base, entry)
                if entry.endswith(".keras") and os.path.isdir(ep):
                    candidate = os.path.join(ep, "model.weights.h5")
                    if os.path.exists(candidate):
                        wpath = candidate
                        cfg_p = os.path.join(ep, "config.json")
                        if os.path.exists(cfg_p) and not result["config"]:
                            with open(cfg_p, encoding="utf-8") as f: result["config"] = json.load(f)
                        break

        if wpath:
            try:
                MAX_LEN=150; VOCAB_SIZE=50000; EMBED_DIM=256; LSTM_UNITS=128; ATTN_UNITS=64; NUM_FEATS=4
                inp_text = tf.keras.Input(shape=(MAX_LEN,), name="text_input")
                x = tf.keras.layers.Embedding(VOCAB_SIZE, EMBED_DIM, mask_zero=False, name="embedding")(inp_text)
                x = tf.keras.layers.SpatialDropout1D(0.3, name="spatial_dropout")(x)
                x = tf.keras.layers.Bidirectional(
                    tf.keras.layers.LSTM(LSTM_UNITS, return_sequences=True, dropout=0.2, name="forward_lstm"),
                    name="bilstm")(x)
                ctx, attn_w = BahdanauAttention(ATTN_UNITS, name="bahdanau_attention")(x)
                x_text = tf.keras.layers.Dropout(0.3, name="text_dropout")(
                    tf.keras.layers.Dense(128, activation="relu", name="text_dense")(ctx))
                inp_num = tf.keras.Input(shape=(NUM_FEATS,), name="numeric_input")
                x_num   = tf.keras.layers.Dense(8, activation="relu", name="num_dense2")(
                    tf.keras.layers.Dense(16, activation="relu", name="num_dense1")(inp_num))
                merged  = tf.keras.layers.Dropout(0.2, name="combined_dropout")(
                    tf.keras.layers.Dense(32, activation="relu", name="combined_dense")(
                        tf.keras.layers.Concatenate(name="concat")([x_text, x_num])))
                out     = tf.keras.layers.Dense(1, activation="sigmoid", name="output_pred")(merged)
                model   = tf.keras.Model(inputs=[inp_text, inp_num], outputs=[out, attn_w], name="FakeShield_v2_explain")
                model([np.zeros((1,MAX_LEN), dtype=np.float32), np.zeros((1,NUM_FEATS), dtype=np.float32)], training=False)
                _load_weights_from_keras3_h5(model, wpath)
                result["model"] = model
            except Exception as e:
                result["model_error"] = f"[weights.h5] {e}"
        break

    if not any(os.path.isdir(b) for b in base_dirs):
        result["model_error"] = (
            "Folder `models/` tidak ditemukan. Struktur yang dibutuhkan: "
            "models/fakeshield_model (7).keras/ berisi config.json + model.weights.h5, "
            "models/tokenizer(6).json + models/scaler(3).pkl"
        )
    return result

artifacts = load_model_artifacts()
model     = artifacts["model"]
tokenizer = artifacts["tokenizer"]
scaler    = artifacts["scaler"]
model_ready = model is not None and tokenizer is not None

# ══════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("""
    <div style='padding:1.5rem 0 1rem;'>
        <div class='nav-title'>FakeShield</div>
        <div class='nav-version'>Deep Learning · ID</div>
    </div><hr style='margin:0 0 1rem;'>
    """, unsafe_allow_html=True)

    page = st.radio("Navigasi", ["Dashboard", " Demo Prediksi"], label_visibility="collapsed")

    _status_text = "Aktif" if model_ready else "Heuristic"
    st.markdown(f"""
    <hr style='margin:1.5rem 0 1rem;'>
    <div style='font-size:0.75rem;color:rgba(255,255,255,0.4);line-height:1.7;'>
        Dataset: 39.667 artikel<br>Periode: 2024–2026<br>
        Model: BiLSTM + Bahdanau Attention {_status_text}<br>Bahasa: Indonesia
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# LOAD DATA
# ══════════════════════════════════════════════════════════════════════════════
df_raw = load_dataset()
df     = preprocess_dataset(df_raw) if df_raw is not None else None

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════
if "Dashboard" in page:
    st.markdown("<div class='hero-banner'><h1 class='hero-title'>FakeShield Dashboard</h1></div>", unsafe_allow_html=True)

    if df is None:
        st.warning("Dataset tidak ditemukan. Letakkan file CSV di folder yang sama dengan `app.py`."); st.stop()

    total   = len(df)
    n_hoaks = int((df["label"] == 1).sum())
    n_valid = int((df["label"] == 0).sum())
    n_kat   = df["kategori"].nunique()

    st.markdown(f"""
    <div class='metric-row'>
        <div class='metric-card total'>
            <div class='metric-label'>Total Artikel</div><div class='metric-value'>{total:,}</div>
            <div class='metric-sub'>Dataset setelah cleaning & balancing</div></div>
        <div class='metric-card hoaks'>
            <div class='metric-label'>Berita Hoaks</div><div class='metric-value'>{n_hoaks:,}</div>
            <div class='metric-sub'>{n_hoaks/total*100:.1f}% dari total dataset</div></div>
        <div class='metric-card valid'>
            <div class='metric-label'>Berita Valid</div><div class='metric-value'>{n_valid:,}</div>
            <div class='metric-sub'>{n_valid/total*100:.1f}% dari total dataset</div></div>
        <div class='metric-card accent'>
            <div class='metric-label'>Kategori Topik</div><div class='metric-value'>{n_kat}</div>
            <div class='metric-sub'>Klasifikasi otomatis dari judul</div></div>
    </div>""", unsafe_allow_html=True)

    # ── Distribusi Pie & Radar ─────────────────────────────────────────────────
    col_pie, col_bar0 = st.columns([1, 1.6], gap="medium")

    with col_pie:
        section("Proporsi Dataset", "Keseimbangan kelas Hoaks vs Valid")
        fig_pie = go.Figure(go.Pie(
            labels=["Hoaks","Valid"], values=[n_hoaks, n_valid],
            marker=dict(colors=[C_HOAKS, C_VALID], line=dict(color="#fff", width=3)),
            hole=0.52, textinfo="percent", textfont=dict(size=13),
            hovertemplate="<b>%{label}</b><br>Jumlah: %{value:,}<br>Proporsi: %{percent}<extra></extra>"))
        fig_pie.add_annotation(text=f"<b>{total:,}</b><br><span style='font-size:10px'>artikel</span>",
            x=0.5, y=0.5, showarrow=False, font=dict(size=16, color=C_DARK), align="center")
        fig_pie.update_layout(**PLOTLY_LAYOUT, height=320, showlegend=True,
            legend=dict(orientation="h", y=-0.12), title="Distribusi Label Dataset")
        st.plotly_chart(fig_pie, use_container_width=True)

    with col_bar0:
        section("Statistik Fitur Numerik", "Perbandingan rata-rata per label")
        feat_means  = df.groupby("label_str")[["jumlah_kata_asli","rasio_kapital_persen","jumlah_tanda_seru","jumlah_tanda_tanya"]].mean().round(2)
        feat_labels = {"jumlah_kata_asli":"Jumlah Kata","rasio_kapital_persen":"Rasio Kapital (%)","jumlah_tanda_seru":"Tanda Seru","jumlah_tanda_tanya":"Tanda Tanya"}
        cats_f  = list(feat_labels.values())
        vals_h  = [feat_means.loc["Hoaks", c] for c in feat_labels]
        vals_v  = [feat_means.loc["Valid",  c] for c in feat_labels]
        max_v   = [max(h,v) or 1 for h,v in zip(vals_h, vals_v)]
        nh = [v/m for v,m in zip(vals_h, max_v)]; nv = [v/m for v,m in zip(vals_v, max_v)]
        fig_feat = go.Figure()
        fig_feat.add_trace(go.Scatterpolar(r=nh+[nh[0]], theta=cats_f+[cats_f[0]], fill="toself", name="Hoaks",
            fillcolor="rgba(230,57,70,0.25)", line=dict(color=C_HOAKS, width=2.5),
            customdata=[[v] for v in vals_h+[vals_h[0]]], hovertemplate="<b>%{theta}</b><br>Nilai: %{customdata[0]:.2f}<extra>Hoaks</extra>"))
        fig_feat.add_trace(go.Scatterpolar(r=nv+[nv[0]], theta=cats_f+[cats_f[0]], fill="toself", name="Valid",
            fillcolor="rgba(42,157,143,0.25)", line=dict(color=C_VALID, width=2.5),
            customdata=[[v] for v in vals_v+[vals_v[0]]], hovertemplate="<b>%{theta}</b><br>Nilai: %{customdata[0]:.2f}<extra>Valid</extra>"))
        fig_feat.update_layout(**PLOTLY_LAYOUT, height=320,
            polar=dict(radialaxis=dict(visible=True, range=[0,1.1], showticklabels=False, gridcolor="#E9ECEF")),
            legend=dict(orientation="h", y=-0.15), title="Profil Fitur Rata-rata (Normalisasi)")
        st.plotly_chart(fig_feat, use_container_width=True)

    st.divider()

    # ── BQ1 — Kategori ────────────────────────────────────────────────────────
    section("Kategori Berita dengan Kasus Hoaks Tertinggi", "Kategori berita apa yang memiliki jumlah kasus hoaks tertinggi berdasarkan total data?")

    cat_stats = df.groupby(["kategori","label_str"]).size().unstack(fill_value=0).rename(columns={"Hoaks":"hoaks","Valid":"valid"})
    cat_stats["total"]     = cat_stats["hoaks"] + cat_stats["valid"]
    cat_stats["pct_hoaks"] = cat_stats["hoaks"] / cat_stats["total"] * 100
    cat_stats["pct_valid"] = cat_stats["valid"] / cat_stats["total"] * 100
    cat_stats = cat_stats.sort_values("hoaks", ascending=False)

    options = st.multiselect("Pilih label untuk ditampilkan:", ["Hoaks", "Valid"], default=["Hoaks", "Valid"])
    bq1_tab1, bq1_tab2 = st.tabs(["Jumlah Artikel", "Rasio Label"])

    with bq1_tab1:
        sort_col = ("hoaks" if "Hoaks" in options and "Valid" not in options
                    else "valid" if "Valid" in options and "Hoaks" not in options else "total")
        cat_sorted = cat_stats.sort_values(sort_col, ascending=True)
        fig_bq1a = go.Figure()
        if "Hoaks" in options:
            fig_bq1a.add_trace(go.Bar(y=cat_sorted.index, x=cat_sorted["hoaks"], name="Hoaks", orientation="h",
                marker_color=C_HOAKS, opacity=0.90, text=cat_sorted["hoaks"].apply(lambda v: f"{v:,}"), textposition="outside"))
        if "Valid" in options:
            fig_bq1a.add_trace(go.Bar(y=cat_sorted.index, x=cat_sorted["valid"], name="Valid", orientation="h",
                marker_color=C_VALID, opacity=0.90, text=cat_sorted["valid"].apply(lambda v: f"{v:,}"), textposition="outside"))
        title_map = {("Hoaks",): "Distribusi Artikel Hoaks per Kategori", ("Valid",): "Distribusi Artikel Valid per Kategori"}
        chart_title = title_map.get(tuple(options), "Distribusi Artikel Hoaks dan Valid per Kategori")
        fig_bq1a.update_layout(**PLOTLY_LAYOUT, barmode="group", height=440, title=chart_title)
        st.plotly_chart(fig_bq1a, use_container_width=True)

    with bq1_tab2:
        if len(options) == 2:
            heatmap_data = cat_stats[["pct_hoaks","pct_valid"]].sort_values("pct_hoaks", ascending=True)
            fig_bq1b = go.Figure(data=go.Heatmap(
                z=heatmap_data.values, x=["Hoaks","Valid"], y=heatmap_data.index,
                colorscale=[[0,C_VALID],[0.5,"#F4F1DE"],[1,C_HOAKS]], zmin=0, zmax=100,
                text=np.round(heatmap_data.values,1), texttemplate="%{text}%",
                textfont=dict(size=11), colorbar=dict(title="Persentase (%)")))
            fig_bq1b.update_layout(**PLOTLY_LAYOUT, height=500, title="Rasio Hoaks dan Valid per Kategori")
        else:
            lp = options[0].lower()
            cat_stats["pct_show"] = cat_stats[lp] / cat_stats["total"] * 100
            cs = cat_stats.sort_values("pct_show", ascending=True)
            fig_bq1b = go.Figure(go.Bar(y=cs.index, x=cs["pct_show"], orientation="h",
                marker=dict(color=cs["pct_show"], colorscale=[[0,C_VALID],[0.5,"#F4F1DE"],[1,C_HOAKS]],
                    showscale=True, colorbar=dict(title="Rasio (%)", thickness=15)),
                text=cs["pct_show"].apply(lambda v: f"{v:.1f}%"), textposition="outside"))
            fig_bq1b.update_layout(**PLOTLY_LAYOUT, height=420, title=f"Rasio {options[0]} per Kategori (%)", xaxis=dict(range=[0,115]))
        st.plotly_chart(fig_bq1b, use_container_width=True)

    st.divider()

    # ── BQ2 — Panjang Teks ────────────────────────────────────────────────────
    section("Pengaruh Panjang Teks terhadap Klasifikasi", "Seberapa besar pengaruh jumlah kata terhadap label hoaks vs valid?")

    df["bin_kata"] = pd.cut(df["jumlah_kata_asli"], bins=[0,30,50,70,90,110,200], labels=["≤30","31–50","51–70","71–90","91–110",">110"])
    bin_stats_raw  = df.groupby("bin_kata", observed=True)["label"].mean() * 100
    bin_hoaks = bin_stats_raw.values; bin_valid = 100 - bin_hoaks

    bq2_t1, bq2_t2 = st.tabs(["Distribusi Panjang Teks", "Proporsi per Kelompok Kata"])

    with bq2_t1:
        fig_bq2a = go.Figure()
        for label_str, col in [("Hoaks", C_HOAKS), ("Valid", C_VALID)]:
            data = df[df["label_str"] == label_str]["jumlah_kata_asli"]
            fig_bq2a.add_trace(go.Violin(y=data, name=label_str, fillcolor=col, line_color=C_DARK,
                opacity=0.75, box_visible=True, meanline_visible=True,
                hovertemplate=f"<b>{label_str}</b><br>Jumlah Kata: %{{y}}<extra></extra>"))
        fig_bq2a.update_layout(**PLOTLY_LAYOUT, height=420, title="Distribusi Panjang Teks per Label",
            yaxis_title="Jumlah Kata", xaxis_title="Label",
            yaxis=dict(gridcolor="#E9ECEF"), xaxis=dict(gridcolor="#E9ECEF"))
        st.plotly_chart(fig_bq2a, use_container_width=True)

    with bq2_t2:
        bins_label   = bin_stats_raw.index.astype(str).tolist()
        df_bin_stack = pd.concat([
            pd.DataFrame({"Kelompok": bins_label, "Persentase": bin_hoaks, "Status": "Hoaks", "Teks": [f"{v:.1f}%" for v in bin_hoaks]}),
            pd.DataFrame({"Kelompok": bins_label, "Persentase": bin_valid, "Status": "Valid",  "Teks": [f"{v:.1f}%" for v in bin_valid]})])
        fig_bq2b = px.bar(df_bin_stack, x="Kelompok", y="Persentase", color="Status", text="Teks",
            barmode="stack", color_discrete_map={"Hoaks": C_HOAKS, "Valid": C_VALID},
            title="Proporsi Komparatif Label per Kelompok Panjang Teks")
        fig_bq2b.update_traces(textposition="inside", insidetextanchor="middle")
        fig_bq2b.update_layout(**PLOTLY_LAYOUT, height=420,
            yaxis=dict(range=[0,105], title="Distribusi Label (%)"),
            xaxis_title="Kelompok Jumlah Kata",
            legend=dict(title="Label:", orientation="h", y=-0.15), xaxis=dict(gridcolor="#E9ECEF"))
        st.plotly_chart(fig_bq2b, use_container_width=True)

    st.divider()

    # ── BQ3 — TF-IDF ─────────────────────────────────────────────────────────
    section("Kata Kunci TF-IDF: Hoaks vs Valid", "Kata kunci apa yang paling dominan dan eksklusif pada masing-masing label?")

    with st.spinner("Menghitung bobot TF-IDF…"):
        tfidf_df, _ = compute_tfidf(df)

    top_excl_h = tfidf_df.nlargest(15, "diff_hoaks").sort_values("diff_hoaks")
    top_excl_v = tfidf_df.nlargest(15, "diff_valid").sort_values("diff_valid")
    fig_bq3 = make_subplots(rows=1, cols=2, subplot_titles=["Top Kata — Hoaks", "Top Kata — Valid"])
    fig_bq3.add_trace(go.Bar(y=top_excl_h["kata"], x=top_excl_h["diff_hoaks"], orientation="h", marker_color=C_HOAKS,
        text=top_excl_h["diff_hoaks"].apply(lambda v: f"{v:.4f}"), textposition="outside",
        hovertemplate="<b>%{y}</b><br>TF-IDF Diff: %{x:.4f}<extra>Hoaks</extra>"), row=1, col=1)
    fig_bq3.add_trace(go.Bar(y=top_excl_v["kata"], x=top_excl_v["diff_valid"], orientation="h", marker_color=C_VALID,
        text=top_excl_v["diff_valid"].apply(lambda v: f"{v:.4f}"), textposition="outside",
        hovertemplate="<b>%{y}</b><br>TF-IDF Diff: %{x:.4f}<extra>Valid</extra>"), row=1, col=2)
    fig_bq3.update_layout(**PLOTLY_LAYOUT, height=520, showlegend=False,
        title="Kata Paling Eksklusif per Label (TF-IDF Differential)",
        xaxis=dict(gridcolor="#E9ECEF"), xaxis2=dict(gridcolor="#E9ECEF"))
    st.plotly_chart(fig_bq3, use_container_width=True)

    st.divider()

    # ── BQ4 — Tren Bulanan ────────────────────────────────────────────────────
    section("Tren Bulanan Berita Hoaks (2024–2026)", "Bagaimana pola publikasi hoaks berubah dari waktu ke waktu?")

    trend = get_trend(df)
    x_str = trend["bulan"].astype(str).tolist()
    fig_bq4 = go.Figure()
    if "Hoaks" in trend.columns:
        fig_bq4.add_trace(go.Scatter(x=x_str, y=trend["Hoaks"], name="Hoaks", mode="lines+markers",
            line=dict(color=C_HOAKS, width=2.5), marker=dict(size=8),
            hovertemplate="<b>%{x}</b><br>Hoaks: %{y}<extra></extra>"))
        if "hoaks_roll3" in trend.columns:
            fig_bq4.add_trace(go.Scatter(x=x_str, y=trend["hoaks_roll3"], name="Hoaks (3 Bulan Avg)",
                mode="lines", line=dict(color="#9B2335", width=2, dash="dot"),
                hovertemplate="<b>%{x}</b><br>Rata-rata: %{y:.1f}<extra></extra>"))
    if "Valid" in trend.columns:
        fig_bq4.add_trace(go.Scatter(x=x_str, y=trend["Valid"], name="Valid", mode="lines+markers",
            line=dict(color=C_VALID, width=2.5), marker=dict(size=8, symbol="square"),
            hovertemplate="<b>%{x}</b><br>Valid: %{y}<extra></extra>"))
    fig_bq4.update_layout(**PLOTLY_LAYOUT, height=450,
        title="Volume Bulanan Berita Hoaks dan Valid (2024–2026)",
        xaxis=dict(gridcolor="#E9ECEF", tickangle=40),
        yaxis=dict(gridcolor="#E9ECEF", title="Jumlah Artikel"),
        legend=dict(orientation="h", y=-0.18))
    st.plotly_chart(fig_bq4, use_container_width=True)
    st.divider()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: DEMO PREDIKSI
# ══════════════════════════════════════════════════════════════════════════════
elif "Demo Prediksi" in page:
    st.markdown("<div class='hero-banner'><h1 class='hero-title'>Demo Prediksi</h1></div>", unsafe_allow_html=True)

    section("Input Teks Berita", "Masukkan isi berita yang ingin diperiksa")

    col_input, col_tip = st.columns([1.8, 1], gap="large")

    def set_hoaks():
        st.session_state["teks_input"] = (
            "DARURAT!!! Pemerintah BEKUKAN Rekening Rakyat Mulai Besok! "
            "Dikabarkan mulai besok pemerintah akan memblokir seluruh rekening masyarakat "
            "yang tidak mendaftar ulang ke kantor kelurahan.")

    def set_valid():
        st.session_state["teks_input"] = (
            "Polemik Mama Yasinta, Senator Minta Masyarakat Fokus pada Persoalan Papua. "
            "Anggota DPD RI dari Papua Barat Filep Wamafma meminta masyarakat Papua tidak terjebak dalam polemik perubahan sikap sejumlah tokoh pasca pemutaran film dokumenter Pesta Babi di berbagai daerah. "
            "Yang harus menjadi fokus kita adalah persoalan pokok yang sedang terjadi di Papua hari ini, yaitu deforestasi dalam skala besar dan berbagai dampak struktural yang akan diwariskan kepada generasi mendatang, kata Filep, Minggu (31/5/2026).")

    with col_input:
        teks_input  = st.text_area("Isi Berita", key="teks_input",
            placeholder="Contoh: Organisasi Kesehatan Dunia (WHO) menetapkan status darurat kesehatan global…", height=380)
        btn_predict = st.button("Analisis Sekarang", type="primary", use_container_width=True)

    with col_tip:
        st.markdown(f"""
        <div style='background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:1.2rem;'>
            <p style='font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:{C_MID};font-weight:600;margin:0 0 0.8rem;'>Ciri-ciri Berita Hoaks</p>
            <ul style='font-size:0.82rem;color:{C_DARK};line-height:1.8;padding-left:1.2rem;margin:0;'>
                <li>Judul provokatif dengan banyak HURUF KAPITAL</li>
                <li>Banyak tanda seru (!!) atau tanya berulang</li>
                <li>Kalimat sangat pendek &amp; tanpa sumber jelas</li>
                <li>Mengandung kata <em>dikabarkan, katanya, viral</em></li>
                <li>Mengancam atau menciptakan kepanikan</li>
            </ul>
        </div>
        <div style='background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:1.2rem;margin-top:1rem;'>
            <p style='font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:{C_VALID};font-weight:600;margin:0 0 0.8rem;'>Ciri-ciri Berita Valid</p>
            <ul style='font-size:0.82rem;color:{C_DARK};line-height:1.8;padding-left:1.2rem;margin:0;'>
                <li>Menggunakan bahasa formal &amp; baku</li>
                <li>Ada kutipan dan atribusi narasumber</li>
                <li>Mencantumkan data, angka, atau institusi resmi</li>
                <li>Penulisan huruf kapital wajar</li>
            </ul>
        </div>""", unsafe_allow_html=True)

    with st.expander("Gunakan contoh teks"):
        c1, c2 = st.columns(2)
        c1.button("Contoh Hoaks", use_container_width=True, on_click=set_hoaks)
        c2.button("Contoh Valid",  use_container_width=True, on_click=set_valid)

    # ── Prediksi ──────────────────────────────────────────────────────────────
    if btn_predict:
        full_text = teks_input.strip()
        if not full_text:
            st.warning("Masukkan isi berita terlebih dahulu.")
        else:
            with st.spinner("Menganalisis teks…"):
                def _preprocess(text):
                    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
                    text = re.sub(r"[@#]\w+", " ", text)
                    text = text.lower()
                    text = re.sub(r"[^a-z\s!?]", " ", text)
                    return re.sub(r"\s+", " ", text).strip()

                text_clean    = _preprocess(full_text)
                words_clean   = text_clean.split()
                all_chars     = len(full_text) or 1
                rasio_kapital = sum(1 for c in full_text if c.isupper()) / all_chars * 100
                jml_seru      = full_text.count("!")
                jml_tanya     = full_text.count("?")
                words_count   = len(full_text.split())

                top_words = []; attn_raw = {}; prob = 0.5

                if model_ready:
                    MAX_LEN = 150
                    seq     = tokenizer.texts_to_sequences([text_clean])
                    padded  = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=MAX_LEN, padding="post", truncating="post")
                    raw_feat = np.array([[rasio_kapital, jml_seru, jml_tanya, words_count]], dtype=np.float32)
                    num_feat = scaler.transform(raw_feat).astype("float32") if scaler else (raw_feat / np.array([[100., 20., 10., 200.]])).astype("float32")
                    outputs = model.predict([padded, num_feat], verbose=0)

                    st.write("OUTPUT 0 SHAPE:", np.array(outputs[0]).shape)
                    st.write("OUTPUT 1 SHAPE:", np.array(outputs[1]).shape)

                    prob = float(outputs[0][0][0])
                    attn_vec = np.array(outputs[1][0])
                    n = min(len(words_clean), MAX_LEN)
                    word_attn = {}
                    for i in range(n):
                        w = words_clean[i]; word_attn[w] = word_attn.get(w, 0.0) + float(attn_vec[i])
                    if word_attn:
                        mx = max(word_attn.values()) or 1.0
                        attn_raw = {k: round(v/mx, 4) for k, v in word_attn.items()}
                    top_words = sorted(attn_raw.items(), key=lambda x: x[1], reverse=True)[:10]
                    top_words = [{"word": w, "score": s} for w, s in top_words]
                else:
                    prov=["dikabarkan","katanya","viral","darurat","segera","bagikan","bocor","curang","palsu","dihapus","ternyata","jangan"]
                    vld=["mengatakan","ujar","menurut","berdasarkan","dikonfirmasi","resmi","kabupaten","kementerian","persen","penelitian"]
                    sc=(0.25 if rasio_kapital>15 else 0.12 if rasio_kapital>8 else 0)+(0.25 if jml_seru>=3 else 0.10 if jml_seru>=1 else 0)+(0.30 if words_count<=30 else 0.15 if words_count<=50 else 0)
                    for w in prov:
                        if w in full_text.lower(): sc+=0.08
                    for w in vld:
                        if w in full_text.lower(): sc-=0.06
                    prob=float(np.clip(sc,0.02,0.98))
                    ps=set(prov); vs=set(vld)
                    attn_raw={w:(1.0 if w in ps else 0.1 if w in vs else 0.2) for w in dict.fromkeys(words_clean)}
                    top_words=[{"word":w,"score":s} for w,s in sorted(attn_raw.items(),key=lambda x:x[1],reverse=True)[:10]]

            is_hoaks   = prob >= 0.5
            label_pred = "Hoaks" if is_hoaks else "Valid"
            confidence = prob if is_hoaks else (1 - prob)
            bar_color  = C_HOAKS if is_hoaks else C_VALID

            if is_hoaks:
                level="Sangat Terindikasi Hoaks" if confidence>=.90 else "Terindikasi Hoaks" if confidence>=.70 else "Perlu Verifikasi"
                narasi=f"Model memprediksi teks ini <b style='color:{C_HOAKS}'>mengandung hoaks</b>. Verifikasi melalui <b>Turnbackhoax.id</b> atau <b>Kompas.com</b> sebelum menyebarkan."
                b_col="rgba(230,57,70,.3)"; bg="rgba(230,57,70,.05)"
            else:
                level="Sangat Kemungkinan Valid" if confidence>=.90 else "Kemungkinan Valid" if confidence>=.70 else "Perlu Verifikasi"
                narasi=f"Model memprediksi teks ini <b style='color:{C_VALID}'>merupakan berita valid</b>. Tetap lakukan verifikasi mandiri terhadap sumber dan konteks berita."
                b_col="rgba(42,157,143,.3)"; bg="rgba(42,157,143,.05)"

            _top3_html = ""
            if top_words:
                _top3_words = ", ".join(f"<b>{d['word']}</b>" for d in top_words[:3])
                _top3_html  = f"<div style='margin-top:.7rem;font-size:.80rem;color:#64748B;'>Kata paling berpengaruh: {_top3_words}</div>"

            st.divider()
            col_hasil, col_attn = st.columns([1, 1], gap="large")

            with col_hasil:
                cls = "hoaks" if is_hoaks else "valid"
                st.markdown(f"""
                <div class='result-panel {cls}' style='text-align:center;padding:2rem 1.5rem;'>
                    <div class='result-label {cls}'>{label_pred}</div>
                    <div style='font-size:0.85rem;color:#64748B;margin:.3rem 0 1.2rem;'>{level}</div>
                    <div style='font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8;margin-bottom:.4rem;'>Confidence Score</div>
                    <div style='font-size:2.4rem;font-weight:900;color:{bar_color};line-height:1;'>{confidence:.1%}</div>
                    <div style='margin:.8rem auto 0;max-width:220px;height:8px;background:#E2E8F0;border-radius:99px;overflow:hidden;'>
                        <div style='height:100%;width:{confidence*100:.1f}%;background:{bar_color};border-radius:99px;'></div>
                    </div>
                    <div style='font-size:.72rem;color:#94A3B8;margin-top:.7rem;'>
                        {"🤖 BiLSTM + Bahdanau Attention" if model_ready else "📐 Heuristic fallback"}
                    </div>
                </div>
                <div style='background:{bg};border:1px solid {b_col};border-radius:10px;padding:1rem 1.2rem;font-size:.84rem;color:{C_DARK};line-height:1.7;margin-top:.8rem;'>
                    {narasi}{_top3_html}
                </div>""", unsafe_allow_html=True)

            with col_attn:
                st.markdown(f"""
                <div style='margin-bottom:.5rem;'>
                    <span style='font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;font-weight:700;color:{bar_color};'> Pengaruh Kata Terhadap Hasil</span><br>
                    <span style='font-size:.78rem;color:#64748B;'>
                        {"Kata-kata yang paling diperhatikan model saat memprediksi hoaks (Bahdanau Attention Score)"
                         if is_hoaks else
                         "Kata-kata yang paling diperhatikan model saat memprediksi valid (Bahdanau Attention Score)"}
                    </span>
                </div>""", unsafe_allow_html=True)

                if top_words:
                    words_bar  = [d["word"] for d in top_words]
                    scores_pct = [d["score"] * 100 for d in top_words]
                    bar_clrs   = ([f"rgba(230,57,70,{max(0.25,(s/100)**0.6):.2f})" for s in scores_pct]
                                  if is_hoaks else
                                  [f"rgba(42,157,143,{max(0.25,(s/100)**0.6):.2f})" for s in scores_pct])
                    fig_attn = go.Figure(go.Bar(
                        x=scores_pct, y=words_bar, orientation="h",
                        marker=dict(color=bar_clrs, line=dict(color="rgba(0,0,0,.08)", width=0.5)),
                        text=[f"{s:.1f}%" for s in scores_pct], textposition="outside",
                        textfont=dict(size=11, color=C_DARK),
                        hovertemplate="<b>%{y}</b><br>Pengaruh: %{x:.1f}%<br><i>Semakin tinggi → semakin diperhatikan model</i><extra></extra>"))
                    fig_attn.update_layout(
                        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                        font=dict(family="'IBM Plex Sans', sans-serif", color=C_DARK),
                        height=max(300, len(top_words)*38+60),
                        yaxis=dict(autorange="reversed", tickfont=dict(size=12, color=C_DARK), gridcolor="#F5F5F5"),
                        xaxis=dict(range=[0,118], showticklabels=False, gridcolor="#E9ECEF"),
                        bargap=0.30, showlegend=False, margin=dict(l=10, r=60, t=10, b=32))
                    st.plotly_chart(fig_attn, use_container_width=True)
                else:
                    st.info("Tidak ada kata signifikan — teks mungkin terlalu pendek.")