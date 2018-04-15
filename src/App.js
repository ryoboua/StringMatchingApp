import React, { Component } from 'react';
import FileUploadContainer from './components/FileUploadContainer'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';


const paperStyle = {
  marginTop: '100px',
  textAlign: 'center',
  width: '45%',
  paddingBottom: '1em',
  height: 'auto'
}
class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div style={{display: 'flex', justifyContent: 'center'}} >
        <Paper style={paperStyle} zDepth={5} >
          <h1 style={{color: '#E21660'}}>Top Hat String Matching App</h1>
          <FileUploadContainer />
        </Paper>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
