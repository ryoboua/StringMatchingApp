import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import { createReadStream } from 'fs'
import fetch from 'node-fetch'
import request from 'superagent'
import FileSaver from 'file-saver';



const formData = new FormData()

export default class FileUploadContainer extends Component {
    constructor(props){
        super(props)

        this.state={
            filesToBeSent:[]
        }

        this.onDrop = this.onDrop.bind(this)
        this.onFormSubmit = this.onFormSubmit.bind(this)

    }

    onDrop(acceptedFiles){
        console.log(acceptedFiles.length)
        let filesToBeSent = this.state.filesToBeSent
        filesToBeSent.push(acceptedFiles)
        this.setState({ filesToBeSent })
    }

    onFormSubmit(e){
        e.preventDefault()
        if(this.state.filesToBeSent.length > 0) {
            let filesArray = this.state.filesToBeSent
            let req = request.post('http://127.0.0.1:5000/upload')
            for(var i in filesArray){
                console.log("files",filesArray[i][0]);
                req.attach(filesArray[i][0].name,filesArray[i][0])
            }
            req.end(async (err,res) => {
              if(err) console.log("error ocurred");
              console.log(res)
              let file = await new Blob([res.text], {type: 'text/csv'})
              FileSaver.saveAs(file, 'ngram_results.csv')

            });
            
        } else{
            alert("Please upload some files first");
          }
   

    }
    
    render(){
       
       return (


     <div className="ui form">
        <form encType="multipart/form-data" onSubmit={this.onFormSubmit} >
            <div className="field">
                <label>File Upload</label>
                <Dropzone accept='.csv' onDrop={files => this.onDrop(files)}>
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
                <input className="ui primary button" value='Upload File' type='submit'/>
        </div>
    
        
        </form>
    </div>


            
        )
    }
}

const python = () => {

}

