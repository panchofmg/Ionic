import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private router: Router
  ) {}

  ngOnInit() {
    // Escucha los cambios en el estado de autenticación
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si hay un usuario autenticado, redirige según el tipo de usuario
        this.redirectBasedOnUserType(user);
      } else {
        // Usuario no autenticado
      }
    });
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc
        .signIn(this.form.value as User)
        .then((res) => {
          this.getUserInfo(res.user.uid);
        })
        .catch((error) => {
          console.log(error);

          this.utilsSvc.presentToast({
            message: error.message,
            duration: 2500,
            color: 'primary',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `users/${uid}`;

      this.firebaseSvc
        .getDocument(path)
        .then((user: User) => {
          this.utilsSvc.saveInLocalStorage('user', user);
          this.utilsSvc.routerLink('/inicio');
          this.form.reset();

          this.utilsSvc.presentToast({
            message: `Te damos la bienvenida ${user.name}`,
            duration: 1500,
            color: 'primary',
            position: 'middle',
            icon: 'person-circle-outline',
          });
        })
        .catch((error) => {
          console.log(error);
          this.utilsSvc.presentToast({
            message: error.message,
            duration: 2500,
            color: 'primary',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  private redirectBasedOnUserType(user) {
    // Obtén el tipo de usuario desde Firebase
    this.firebaseSvc.getUserTipoUsuario(user.uid).subscribe((tipoUsuario) => {
      if (tipoUsuario === 'alumno') {
        // Redirige al usuario a la página de inicio para alumnos
        this.router.navigate(['/inicio', { username: user.displayName }]);
      } else if (tipoUsuario === 'profesor') {
        // Redirige al usuario a la página de inicio para profesores
        this.router.navigate(['/profesor', { username: user.displayName }]);
      } else {
        // Tipo de usuario desconocido
        console.log('Tipo de usuario desconocido');
      }
    });
  }
}
