import os
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load mô hình và vectorizer
vectorizer = joblib.load("models/vectorizer.pkl")
model = joblib.load("models/task_classifier.pkl")

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    task_text = data.get("task", "")
    X = vectorizer.transform([task_text])
    prediction = model.predict(X)[0]
    return jsonify({"prediction": prediction})

if __name__ == "__main__":
    # Lấy port từ biến môi trường (cho deploy)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
