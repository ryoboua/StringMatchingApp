import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import request from 'superagent'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import csv from 'fast-csv'
import RaisedButton from 'material-ui/RaisedButton'


const  time = new Date()



// - sheet.js tutorial on create excel files - https://redstapler.co/sheetjs-tutorial-create-xlsx/
const s2ab = s => { 
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;    
}

const generateExcel = (exactMatches, ngramResults) => {
    let workbook = XLSX.utils.book_new()
    workbook.Props = {
        Title: 'Sring Results',
        Author: 'James Ramsey and Reginald Yoboua'
    }
    //Creating Exact Matches Sheet
    workbook.SheetNames.push('Exact Matches')
    let exactMatchSheet = XLSX.utils.aoa_to_sheet(exactMatches)
    workbook.Sheets['Exact Matches'] = exactMatchSheet

    //Creating ngram Sheet
    workbook.SheetNames.push('Ngram Results')
    let ngramSheet = XLSX.utils.aoa_to_sheet(ngramResults)
    workbook.Sheets['Ngram Results'] = ngramSheet

    let workbook_out = XLSX.write(workbook,{bookType: 'xlsx', type: 'binary'})
    let file = new Blob([s2ab(workbook_out)], {type: 'text/csv'})

    FileSaver.saveAs(file, 'ngram_results_test')

}

export default class FileUploadContainer extends Component {
    constructor(props){
        super(props)

        this.state={ filesToBeSent: [] }
        this.onDrop = this.onDrop.bind(this)
        this.onFormSubmit = this.onFormSubmit.bind(this)
        this.sendFiles = this.sendFiles.bind(this)
    }

    onDrop(acceptedFiles){
        let filesToBeSent = this.state.filesToBeSent.concat(acceptedFiles)
        this.setState({ filesToBeSent }, () => console.log(this.state.filesToBeSent.length))
    }

    onFormSubmit(e){
        e.preventDefault()
        this.state.filesToBeSent.length ? 
        this.sendFiles(this.state.filesToBeSent) : alert("Please upload some files first")

    }

    sendFiles([file,...tail]){
        console.log(file.name);
        let req = request.post('http://127.0.0.1:5000/upload')
        req.attach(file.name, file)
        req.end(
            async (err,res) => {
            if(err) console.log("error ocurred: ", err)
            if(tail.length) this.sendFiles(tail) 
            return generateExcel(res.body.exact_matches, res.body.ngram_results)

        })
    }

    render(){
       const DropZoneStyle = {
        height: '375px',
        width: '85%',
        borderStyle: 'dotted',
        marginBottom: '2em',
        color: '#E21660'
       }
  
       return (
                    <form encType="multipart/form-data" onSubmit={this.onFormSubmit} >
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
                            <Dropzone style={DropZoneStyle} accept='.csv' onDrop={files => this.onDrop(files)}>
                                <div><h3 style={{marginTop: '170px'}}>Try dropping some files here, or click to select files to upload.</h3></div>
                            </Dropzone>
                            <RaisedButton backgroundColor='#E21660' labelColor='white' label="Match Accounts" primary={false} style={{}} type='input' />
                        </div>
                    </form>
        )
    }
}

