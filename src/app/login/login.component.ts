import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm !: FormGroup
  private baseUrl = 'http://localhost:5000/';
  constructor(private formBuilder:FormBuilder, private http:HttpClient, private router:Router) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  onLogin(){
    this.http.get<any>(`${this.baseUrl}/signup`)
    .subscribe(res => {
      const user = res.find((a:any)=>{
        return a.email === this.loginForm.value.email && a.password === this.loginForm.value.password
      });

      if(user)
      {
        Swal.fire("Login successfull !!");
        this.loginForm.reset();
        this.router.navigate(['dashboard'])
      }
      else
      {
        Swal.fire("User not found !!")
      }
    }, err =>{
        Swal.fire("Something went wrong !!")
    })
  }

}
