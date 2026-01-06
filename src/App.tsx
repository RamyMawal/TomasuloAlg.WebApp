import { SimulatorProvider } from './context/SimulatorContext'
import Header from './components/Header'
import ConfigPanel from './components/ConfigPanel'
import InstructionInput from './components/InstructionInput'
import InstructionTable from './components/InstructionTable'
import ReservationStations from './components/ReservationStations'
import RegisterFile from './components/RegisterFile'
import AnnotationPanel from './components/AnnotationPanel'

function App() {
  return (
    <SimulatorProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar - Config and Input */}
            <div className="lg:col-span-1 space-y-6">
              <ConfigPanel />
              <InstructionInput />
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3 space-y-6">
              <InstructionTable />
              <ReservationStations />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RegisterFile />
                <AnnotationPanel />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SimulatorProvider>
  )
}

export default App
