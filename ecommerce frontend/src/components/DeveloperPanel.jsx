const KAFKA_UI =
  import.meta.env.VITE_KAFKA_UI ||
  "http://localhost:8085";

function pretty(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function DeveloperPanel({ data }) {
  if (!data) {
    return (
      <aside className="dev-panel">
        <div className="dev-header">
          <div className="dev-header-row">
            <h2>Developer View</h2>
            <span className="live">● API READY</span>
          </div>

          <p>
            Interact with the store to inspect backend behavior.
          </p>
        </div>

        <div className="empty">
          <div className="empty-icon">⚡</div>
          <h3>Start interacting</h3>
          <p>
            Load products, add to cart, place an order or add a product.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="dev-panel">
      <div className="dev-header">
        <div className="dev-header-row">
          <h2>Developer View</h2>
          <span className="live">● LIVE</span>
        </div>

        <p>
          Real frontend actions mapped to your microservice APIs.
        </p>
      </div>

      <div className="dev-content">
        <div className="operation">
          {data.operation}
        </div>

        <h1>{data.title}</h1>

        <p className="description">
          {data.description}
        </p>

        {data.explanation && (
          <div className="explanation-card">
            <div className="explanation-title">
              WHAT JUST HAPPENED?
            </div>

            <p>{data.explanation}</p>
          </div>
        )}

        <div className="endpoint-label">
          ENDPOINT
        </div>

        <div className="endpoint">
          <span className="method">
            {data.method}
          </span>
          {data.endpoint}
        </div>

        <div className="code-label">
          <span>REQUEST</span>
          <span>JSON</span>
        </div>

        <pre className="code">
          {pretty(data.request ?? {})}
        </pre>

        <div className="code-label">
          <span>RESPONSE</span>
          <span>JSON</span>
        </div>

        <pre className="code">
          {pretty(data.response ?? {})}
        </pre>

        <div className={`status ${data.error ? "status-error" : ""}`}>
          ● {data.status}
        </div>

        {data.flow?.length > 0 && (
          <div className="flow">
            <div className="flow-title">
              REQUEST FLOW
            </div>

            <div className="flow-row">
              {data.flow.map((step, index) => (
                <span className="flow-fragment" key={`${step}-${index}`}>
                  <span className="flow-box">
                    {step}
                  </span>

                  {index < data.flow.length - 1 && (
                    <span className="flow-arrow">
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.kafka && (
          <div className="kafka-section">
            <div className="kafka-header">
              <h3>Event-Driven Processing</h3>
              <span className="kafka-badge">
                APACHE KAFKA
              </span>
            </div>

            <div className="explanation-card">
              <div className="explanation-title">
                ASYNC EVENT
              </div>

              <p>
                Order Service publishes ORDER_CREATED to the
                <strong> order-events</strong> topic.
              </p>
            </div>

            <a
              className="kafka-ui-button"
              href={KAFKA_UI}
              target="_blank"
              rel="noreferrer"
            >
              Open Kafka UI ↗
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
