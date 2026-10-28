
import logging
import traceback
import uuid

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger("milky-macaron")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/api/checkout", methods=["POST"])
def checkout():
    request_id = str(uuid.uuid4())
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "request_id": request_id,
            "message": "Invalid request."
        }), 400

    items = data.get("items")

    if not isinstance(items, list) or not items:
        return jsonify({
            "success": False,
            "request_id": request_id,
            "message": "Your cart is empty."
        }), 400

    logger.info(
        "CHECKOUT_STARTED request_id=%s item_count=%d",
        request_id,
        len(items)
    )

    try:
        # Intentional demo failure for SavageOps.
        # Every valid checkout triggers this error.
        raise KeyError("DEMO: payment_method is missing")

    except Exception as exc:
        logger.exception(
            "CHECKOUT_FAILED request_id=%s",
            request_id
        )

        error_details = {
            "event": "checkout_error",
            "request_id": request_id,
            "error_type": type(exc).__name__,
            "message": str(exc),
            "stack_trace": traceback.format_exc()
        }

        # Structured error event is available for future
        # SavageOps webhook integration.
        logger.error(
            "SAVAGEOPS_EVENT %s",
            error_details
        )

        return jsonify({
            "success": False,
            "request_id": request_id,
            "message": (
                "Checkout failed! "
                "The error has been logged for investigation."
            )
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )

