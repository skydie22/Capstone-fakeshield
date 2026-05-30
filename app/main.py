from fastapi import FastAPI, HTTPException
import logging
import time
from .predictor import get_predictor
from .schemas import PredictionInput, PredictionOutput

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FakeShield API", description="API deteksi hoaks", version="3.0.0")

# Load semua saat startup
predictor = get_predictor()
predictor._load_model()
predictor._load_tokenizer()
predictor._load_scaler()
logger.info("✅ Model, tokenizer, dan scaler berhasil dimuat!")


@app.post("/predict", response_model=PredictionOutput)
async def predict(input_data: PredictionInput):
    start = time.time()
    try:
        result = predictor.predict(input_data.text)
        logger.info("Prediction: label=%s | confidence=%.4f", result.label, result.confidence)
        return result
    except Exception as e:
        logger.error("Error in prediction: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    finally:
        logger.info("Prediction took %.2fs", time.time() - start)


@app.get("/health")
async def health():
    return {
        "status":           "healthy",
        "model_loaded":     predictor.model is not None,
        "tokenizer_loaded": predictor.tokenizer is not None,
        "scaler_loaded":    predictor.scaler is not None,
    }


@app.get("/metrics")
async def metrics():
    return {
        "model_version": "3.0.0",
        "status":        "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
