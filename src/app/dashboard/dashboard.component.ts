import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { FileService } from '../file.service';
import {Chart, scaleService} from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  
})
export class DashboardComponent implements OnInit {
  
    
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  public yearForm !: FormGroup;
  public yearData: any;
  public accData:any;
  public futureData:any;
  public chart:any = [];
  public yearLabel:any = []
  public actualSales:any = []
  public predictedSales:any = []
  public predictForm !: FormGroup;
  public fileName : any;
  public date!:Date;

  ngOnInit() {

    this.yearForm = this.formBuilder.group({
      start_year: ['', [Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
      end_year: ['', [Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.minLength(4),
      Validators.maxLength(4)
      ]]
    });
    
    this.predictForm=this.formBuilder.group({
      year: ['', [Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.minLength(4),
        Validators.maxLength(4)]]
    });
   this.createChart(this.yearLabel, this.actualSales, this.predictedSales)
  }

 
  createChart(yearLabel:any, actualSales:any, predictedSales:any)
  {
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: yearLabel,
        datasets: [
          {
            label:"Actual Sales",
            data: actualSales,
            borderColor: '#3cba9f',
            fill: false
          },
          {
            label:"Predicted Sales",
            data:predictedSales,
            borderColor: '#ff0000',
            fill: false
          },
        ]
      },
      options: {
        responsive: true,
        scales: {
          xAxes: [ {
            
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Year'
            },
            ticks: {
              major: {
                fontStyle: 'bold',
                fontColor: '#FF0000'
                
              }
            }
          } ],
          yAxes: [ {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'SalesInMillions',
 
            }
          } ]
        }
      }
    })
  }
  
 
  sendYear(start_year:any, end_year:any) {
   
    this.fileService.getYear(start_year,end_year, this.fileName).subscribe(data => {
      this.yearData = data;
      console.log(Object.keys(this.yearData).length);
      this.yearLabel = Object.keys(this.yearData);
      this.actualSales = Object.keys(this.yearData).map(k => this.yearData[k]).map(val => val['actual_sales']);
      this.predictedSales = Object.keys(this.yearData).map(k => this.yearData[k]).map(val => val['predicted_sales']);
      console.log(this.actualSales)
      console.log(this.predictedSales)
      this.createChart(this.yearLabel, this.actualSales, this.predictedSales)

     });

   
     
  }

  find(){
    this.fileService.getAccuracy(this.fileName).subscribe(data => {
      this.accData = data;
      console.log(this.accData);
    });

  }
  predictFuture(formValues:{year:any;}){
    this.fileService.getfuture(formValues.year, this.fileName).subscribe(data => {
      this.futureData = data;
      console.log(this.futureData?.predicted_sales);
    });

  }



  filenames: string[] = [];
  fileStatus = { status: '', requestType: '', percent: 0 };
  
  constructor(private fileService: FileService,private formBuilder: FormBuilder) {}

  onSubmit(): void{

  }


  // define a function to upload files
  onUploadFiles(files: File[]): void {
    const formData = new FormData();
    for (const file of files) { 
      this.fileName = file.name
      formData.append('files', file, file.name); 
      console.log(this.fileName)
    }
    this.fileService.upload(formData).subscribe(
      event => {
        console.log(event);
        this.resportProgress(event);
        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }


  private resportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch(httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading... ');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Downloading... ');
        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          this.fileStatus.status = 'done';
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          saveAs(new File([httpEvent.body!], httpEvent.headers.get('File-Name')!, 
                  {type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`}));
          // saveAs(new Blob([httpEvent.body!], 
          //   { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`}),
          //    httpEvent.headers.get('File-Name'));
        }
        this.fileStatus.status = 'done';
        break;
        default:
          console.log(httpEvent);
          break;
      
    }
  }

  private updateStatus(loaded: number, total: number, requestType: string): void {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round(100 * loaded / total);
  }
  ReadMore:boolean = true
  visible:boolean = false
  onclick()
  {
    this.ReadMore = !this.ReadMore; //not equal to condition
    this.visible = !this.visible
  }
  PickMore:boolean=true;
  v:boolean=false
  onpick(){
    this.PickMore = !this.PickMore; //not equal to condition
    this.v = !this.v

  }
  
}

