import logging
import warnings

class _NoFunctionCallWarning(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        # Filter out function call warnings
        if "there are non-text parts in the response:" in message:
            return False
        # Filter out auth config warnings
        if "auth_config or auth_config.auth_scheme is missing" in message:
            return False
        if "Will skip authentication" in message:
            return False
        if "Using FunctionTool instead" in message:
            return False
        return True

# Suppress experimental feature warnings
warnings.filterwarnings("ignore", message=".*EXPERIMENTAL.*BaseAuthenticatedTool.*", category=UserWarning)

# Disable the specific problematic logger
logging.getLogger("google_adk.google.adk.tools.base_authenticated_tool").disabled = True

# Apply filter to key loggers
filter_instance = _NoFunctionCallWarning()
for logger_name in ["google_genai.types", "google.adk", "mcp", ""]:
    logging.getLogger(logger_name).addFilter(filter_instance)