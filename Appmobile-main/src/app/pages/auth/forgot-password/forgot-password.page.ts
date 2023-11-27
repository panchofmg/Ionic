import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {


  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  })

  firebaseSvc = inject(FirebaseService);
  utlisSvc = inject(UtilsService);
  ngOnInit() {
  }


  async submit() {
    if (this.form.valid) {

      const loading = await this.utlisSvc.loading();
      await loading.present();



      this.firebaseSvc.sendRecoveryEmail(this.form.value.email).then(res => {
        
        this.utlisSvc.presentToast({
          message: 'Correo enviado con éxito',
          duration: 1500,
          color: 'primary',
          position:'middle',
          icon: 'mail-outline'
        })

        this.utlisSvc.routerLink('/auth');
        this.form.reset();

      }).catch(error => {
        console.log(error);
        
        this.utlisSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position:'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
      })
    }
  }



}
