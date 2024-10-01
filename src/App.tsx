import DelaunayVisualization from './ChiShapeVisualization';
import { MantineProvider, createTheme } from '@mantine/core';


const theme = createTheme({
  cursorType: 'pointer',
  colors: {
    customPrimary: [
      "#e4f8ff",
      "#d6ecf6",
      "#b4d6e6",
      "#8cbed6",
      "#6caac8",
      "#579dc0",
      "#4997bd",
      "#3883a7",
      "#2a7597",
      "#0c6687"
    ]
  },
  primaryColor: 'customPrimary',
  fontFamily: 'Varela Round, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: { fontFamily: 'Varela Round, sans-serif' },
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