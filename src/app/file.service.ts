import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class FileService {
  private server = 'http://localhost:5000';

  constructor(private http: HttpClient) {}
  getYear(start_year: any, end_year:any, filename:any): Observable<any> {
    return this.http.get(`${this.server}/predict?startYear=${start_year}&&endYear=${end_year}&&filename=${filename}`);
  }
  getAccuracy(filename:any): Observable<any> {
    return this.http.get(`${this.server}/accuracy?filename=${filename}`);
  }
  getfuture(year:any, filename:any): Observable<any> {
    return this.http.get(`${this.server}/predict_year?year=${year}&&filename=${filename}`);
  }
  // define function to upload files
  upload(formData: FormData): Observable<HttpEvent<string[]>> {
    return this.http.post<string[]>(`${this.server}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  // define function to download files
  download(filename: string): Observable<HttpEvent<Blob>> {
    return this.http.get(`${this.server}/file/download/${filename}/`, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    });
  }
  
}