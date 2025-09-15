import joblib
import json

# Load mô hình và vectorizer
vectorizer = joblib.load("api/models/vectorizer.pkl")
model = joblib.load("api/models/task_classifier.pkl")

def handler(request, response):
    try:
        data = request.json  # Vercel tự parse JSON
        task_text = data.get("task", "")
        X = vectorizer.transform([task_text])
        prediction = model.predict(X)[0]

        response.status_code = 200
        response.headers["Content-Type"] = "application/json"
        response.text = json.dumps({"prediction": prediction})

    except Exception as e:
        response.status_code = 500
        response.text = json.dumps({"error": str(e)})
