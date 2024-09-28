import DelaunayVisualization from './ChiShapeVisualization';
import { MantineProvider } from '@mantine/core';

function App() {
  return (
    <div className="App">
      <MantineProvider>
        <DelaunayVisualization />
      </MantineProvider>

    </div>
  );
}

export default App;