from pydantic import BaseModel
from typing import List, Dict, Any

class PredictionInput(BaseModel):
    text: str

class SuspiciousWord(BaseModel):
    word: str
    attention_score: float

class PredictionOutput(BaseModel):
    label: str
    confidence: float
    confidence_raw: float
    confidence_level: str
    confidence_color: str
    top_suspicious_words: List[SuspiciousWord]
    attention_per_word: Dict[str, float]