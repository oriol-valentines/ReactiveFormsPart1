import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
// IMPORTACIONES PARA VALIDACION ASINCRONA
import { AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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

    // EMAIL CON VALIDACION ASINCRONA (tercer parametro)
    email: new FormControl('', 
      [Validators.required, Validators.email],
      [this.emailExistsValidator()]
    ),

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

    newsletter: new FormControl(false),

    // ===== FORMARRAY PARA PASSATGERS ADDICIONALS =====
    additionalPassengers: new FormArray([])
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

    // ERROR DE EMAIL YA EXISTENTE (validacion asincrona)
    if (control.errors['emailExists']) {
      return 'Aquest email ja està registrat';
    }

    // MENSAJE GENERICO
    return 'Error de validació';
  }

  // ============ NUEVAS FUNCIONALIDADES ============

  // 1. FORMCONTROL INDEPENDIENTE PARA FILTRO DE BUSQUEDA
  searchControl: FormControl = new FormControl('');

  // ARRAY FILTRADO DE DESTINACIONES
  filteredDestinations: string[] = this.destinations;

  // CONSTRUCTOR - SE EJECUTA AL CREAR EL COMPONENTE
  constructor() {
    // CONFIGURAR FILTRO DE DESTINACIONES
    this.setupDestinationFilter();
    
    // CONFIGURAR SINCRONIZACION DE PASSATGERS
    this.setupPassengersSync();
    
    // CONFIGURAR CALCULO DE PRECIO
    this.calculatePrice();
  }

  // METODO PARA CONFIGURAR EL FILTRO DE DESTINACIONES
  setupDestinationFilter(): void {
    // SUBSCRIBIRSE A LOS CAMBIOS DEL CAMPO DE BUSQUEDA
    this.searchControl.valueChanges.subscribe((searchTerm: string) => {
      // SI NO HAY TEXTO, MOSTRAR TODAS LAS DESTINACIONES
      if (!searchTerm) {
        this.filteredDestinations = this.destinations;
        return;
      }
      
      // FILTRAR DESTINACIONES QUE CONTENGAN EL TEXTO (sin case sensitive)
      this.filteredDestinations = this.destinations.filter(dest =>
        dest.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  // 2. GETTER PARA ACCEDER AL FORMARRAY DE PASSATGERS ADDICIONALS
  get additionalPassengers(): FormArray {
    return this.bookingForm.get('additionalPassengers') as FormArray;
  }

  // METODO PARA CREAR UN FORMGROUP DE PASSATGER
  createPassengerGroup(): FormGroup {
    return new FormGroup({
      // NOMBRE DEL PASSATGER ADICIONAL
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      // EDAD DEL PASSATGER
      age: new FormControl('', [Validators.required, Validators.min(0), Validators.max(120)]),
      // RELACION CON EL TITULAR
      relationship: new FormControl('', Validators.required)
    });
  }

  // METODO PARA AJUSTAR EL NUMERO DE PASSATGERS EN EL FORMARRAY
  adjustPassengers(count: number): void {
    // NUMERO ACTUAL DE PASSATGERS ADICIONALES EN EL ARRAY
    const currentLength = this.additionalPassengers.length;
    
    // PASSATGERS ADICIONALES NECESARIOS (total - 1 titular)
    const needed = count - 1;

    // SI NEEDED ES NEGATIVO O CERO, LIMPIAR EL ARRAY
    if (needed <= 0) {
      this.additionalPassengers.clear();
      return;
    }

    // SI NECESITAMOS MAS PASSATGERS, AÑADIRLOS
    if (needed > currentLength) {
      for (let i = currentLength; i < needed; i++) {
        this.additionalPassengers.push(this.createPassengerGroup());
      }
    } 
    // SI NECESITAMOS MENOS, ELIMINARLOS
    else if (needed < currentLength) {
      for (let i = currentLength; i > needed; i--) {
        this.additionalPassengers.removeAt(i - 1);
      }
    }
  }

  // METODO PARA CONFIGURAR LA SINCRONIZACION AUTOMATICA
  setupPassengersSync(): void {
    // SUBSCRIBIRSE A LOS CAMBIOS DEL CAMPO 'passengers'
    this.bookingForm.get('passengers')?.valueChanges.subscribe(value => {
      // CONVERTIR A NUMERO Y AJUSTAR
      const count = parseInt(value) || 0;
      this.adjustPassengers(count);
    });
  }

  // 3. VALIDADOR ASINCRONO PARA EMAIL
  emailExistsValidator(): AsyncValidatorFn {
    return (control): Observable<ValidationErrors | null> => {
      // SI NO HAY VALOR, NO VALIDAR
      if (!control.value) {
        return of(null);
      }

      // EMAILS QUE YA EXISTEN EN EL SISTEMA
      const existingEmails = ['test@test.com', 'reserva@viajes.com', 'admin@travel.com'];

      // SIMULAR PETICION HTTP CON DELAY DE 1 SEGUNDO
      return of(control.value).pipe(
        delay(1000),
        map(email => {
          // COMPROBAR SI EL EMAIL EXISTE
          const exists = existingEmails.includes(email.toLowerCase());
          // SI EXISTE, RETORNAR ERROR, SI NO, NULL
          return exists ? { emailExists: true } : null;
        })
      );
    };
  }

  // PROPIEDAD PARA MOSTRAR ESTADO DE VALIDACION ASINCRONA
  get emailValidating(): boolean {
    const emailControl = this.bookingForm.get('email');
    return emailControl?.status === 'PENDING';
  }

  // 4. CALCULO DE PRECIO TOTAL
  totalPrice: number = 0;

  // METODO PARA CALCULAR EL PRECIO TOTAL
  calculatePrice(): void {
    // SUBSCRIBIRSE A CAMBIOS EN travelClass Y passengers
    this.bookingForm.valueChanges.subscribe(() => {
      // OBTENER CLASE DE VIAJE
      const travelClass = this.bookingForm.get('travelClass')?.value;
      // OBTENER NUMERO DE PASSATGERS
      const passengers = parseInt(this.bookingForm.get('passengers')?.value) || 0;

      // DEFINIR PRECIOS BASE POR CLASE
      let basePrice = 0;
      if (travelClass === 'Turista') {
        basePrice = 100;
      } else if (travelClass === 'Business') {
        basePrice = 250;
      } else if (travelClass === 'Primera classe') {
        basePrice = 500;
      }

      // CALCULAR PRECIO TOTAL (precio base * numero de passatgers)
      this.totalPrice = basePrice * passengers;
    });
  }
}