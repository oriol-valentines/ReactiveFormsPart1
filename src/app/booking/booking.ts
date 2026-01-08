import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, ReactiveFormsModule, NgClass],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking {

   // ARRAY DE DESTINACIONES PARA EL SELECT
  destinations: string[] = [
    'Barcelona',
    'Madrid',
    'Valencia',
    'Sevilla',
    'Bilbao',
    'Mallorca'
  ];

  // DEFINICION DEL FORMULARIO REACTIVO
  bookingForm: FormGroup = new FormGroup({

    // ===== DADES DEL CLIENT =====
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(
        /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ\s]+$/
      )
    ]),

    dni: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/i)
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[679]\d{8}$/)
    ]),

    birthDate: new FormControl('', Validators.required),

    // ===== INFORMACIO DEL VIATGE =====
    destination: new FormControl('', Validators.required),

    departureDate: new FormControl('', Validators.required),

    returnDate: new FormControl('', Validators.required),

    tripType: new FormControl('', Validators.required),

    travelClass: new FormControl('', Validators.required),

    passengers: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(10)
    ]),

    // ===== CONDICIONS =====
    terms: new FormControl(false, Validators.requiredTrue),

    newsletter: new FormControl(false)
  });

  // METODO QUE SE EJECUTA AL ENVIAR EL FORMULARIO
  onSubmit(): void {

    // SI EL FORMULARIO NO ES VALIDO, NO SE ENVIA
    if (!this.bookingForm.valid) {
      return;
    }

    // MOSTRAR DATOS POR CONSOLA
    console.log('RESERVA:', this.bookingForm.value);

    // ALERTA DE CONFIRMACION
    alert('Reserva enviada correctament');
  }

  // FUNCION PARA SABER SI UN CAMPO ES INVALIDO
  isFieldInvalid(field: string): boolean {
    const control = this.bookingForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  // FUNCION QUE DEVUELVE EL MENSAJE DE ERROR ADECUADO
  getErrorMessage(field: string): string {
    const control = this.bookingForm.get(field);

    // SI NO HAY ERRORES O NO SE HA TOCADO EL CAMPO
    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Aquest camp és obligatori';
    }

    if (control.errors['requiredTrue']) {
      return 'Has de acceptar les condicions';
    }

    if (control.errors['email']) {
      return 'Format de email incorrecte';
    }

    if (control.errors['minlength']) {
      return `Mínim ${control.errors['minlength'].requiredLength} caràcters`;
    }

    if (control.errors['min']) {
      return `El valor mínim és ${control.errors['min'].min}`;
    }

    if (control.errors['max']) {
      return `El valor màxim és ${control.errors['max'].max}`;
    }

    if (control.errors['pattern']) {
      return 'Format incorrecte';
    }

    // MENSAJE GENERICO
    return 'Error de validació';
  }
}
