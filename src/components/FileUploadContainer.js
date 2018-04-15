import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import request from 'superagent'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress';

// - sheet.js tutorial on create excel files - https://redstapler.co/sheetjs-tutorial-create-xlsx/
const s2ab = s => { 
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;    
}

export default class FileUploadContainer extends Component {
    constructor(props){
        super(props)

        this.state = { 
            filesToBeSent: [],
            showForm: true
        }
        this.onDrop = this.onDrop.bind(this)
        this.onFormSubmit = this.onFormSubmit.bind(this)
        this.sendFiles = this.sendFiles.bind(this)
        this.generateExcel = this.generateExcel.bind(this)
        this.checkResponse = this.checkResponse.bind(this)
        this.reset = this.reset.bind(this)
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
        this.setState({showForm: false, workingFile: file.name})
        let req = request.post('http://127.0.0.1:5000/upload')
        req.attach(file.name, file)
        req.end(
            (err,res) => {
                if(err) console.log("error ocurred: ", err)
                console.log(res)
                if(tail.length) this.sendFiles(tail)
                if(!tail.length) this.reset()
                return this.checkResponse(res)
        })
    }
    
    checkResponse(res){
        res.body.parsingError ? 
        this.parsingError(res) : this.generateExcel(res.body.exact_matches, res.body.ngram_results)
    }

    parsingError(res){
        const fileName = res.body.parsingError.fileName
        const reason = res.body.parsingError.reason
        const newFileList = this.state.filesToBeSent.filter( file => file.name !== fileName)
        this.setState({filesToBeSent: newFileList})
        alert(fileName + ' - ' + reason)
    }


    generateExcel(exactMatches, ngramResults){
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

    reset(){
        return this.setState({showForm: true, filesToBeSent: []})
    }

    render(){

       const DropZoneStyle = {
        height: '375px',
        width: '85%',
        borderStyle: 'dotted',
        marginBottom: '1em',
        color: '#E21660'
       }

       const fileList = this.state.filesToBeSent.map( (file, index) => <li key={index} style={{padding: '0.5em'}} >{file.name}</li>)
       const form = (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
                <Dropzone style={DropZoneStyle} accept='.csv' onDrop={files => this.onDrop(files)}>
                    <div>
                        <h3 style={{marginTop: '170px'}}>Try dropping some files here, or click to select files to upload.</h3>
                        <p>CSV file must have a header titled 'Company'</p>
                        <p></p>
                    </div>
                </Dropzone>
                <ol>{fileList}</ol>
                <RaisedButton
                    backgroundColor='#E21660'
                    labelColor='#FFFFFF' 
                    label="Match Accounts" 
                    primary={false}
                    type='input'
                />   
            </div>
        )
       const progress = (
            <div style={{marginTop: '150px'}} >
                <CircularProgress style={{paddingBottom: '2em'}} size={80} thickness={5}/>
                <p>Working on file {this.state.workingFile}</p>
            </div>)
       const content = this.state.showForm ? form :progress

       return (
            <form encType="multipart/form-data" onSubmit={this.onFormSubmit} >
                {content}
            </form>
        )
    }
}

