import reporte_diario from "./reports/reporte_diario";

function App() {
  return <div>
    <h1>Server</h1>
    <button onClick={() => reporte_diario()}>Enviar PDF</button>
  </div>
}

export default App;
