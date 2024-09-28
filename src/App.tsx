import DelaunayVisualization from './ChiShapeVisualization';
import { MantineProvider, createTheme } from '@mantine/core';


const theme = createTheme({
  cursorType: 'pointer',
});

function App() {
  return (
    <div className="App">
      <MantineProvider theme={theme}>
        <DelaunayVisualization />
      </MantineProvider>

    </div>
  );
}

export default App;