import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public signupForm !: FormGroup
  private baseUrl = 'http://localhost:5000/';
  constructor(private formBuilder:FormBuilder, private http:HttpClient, private router:Router) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      name:['',[Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]

    })
  }

  onRegister(){
    this.http.post<any>(`${this.baseUrl}/signup`,this.signupForm.value)
    .subscribe(res =>{
      Swal.fire("SignUp successfull !!");
      this.signupForm.reset();
      this.router.navigate(['login'])
    }, err=>{
      Swal.fire("Something went wrong !!")
    })
  }
}
