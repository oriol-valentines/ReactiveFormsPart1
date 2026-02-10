import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
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

  destinations: string[] = [
    'Barcelona',   // Cada elemento es un string
    'Madrid',
    'Valencia',
    'Sevilla',
    'Bilbao',
    'Mallorca'
  ];
  
  bookingForm: FormGroup = new FormGroup({ //la varible bookingForm crea una nueva instancia que recibe un objeto con los campos
    
    fullName: new FormControl(
      '',
      [
        Validators.required,
        Validators.minLength(3),  
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]
    ),

    dni: new FormControl(
      '',  //valor por defect9o
      [
        Validators.required,
        Validators.pattern(/^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/i)
      ]
    ),

    email: new FormControl(
      '',
      [
        Validators.required,
        Validators.email
      ],
      [
        this.emailExistsValidator()  //se define más abajo
      ]
    ),

    // Teléfono móvil español
    phone: new FormControl(
      '',
      [
        Validators.required, //ca mpo requerido
        Validators.pattern(/^[679]\d{8}$/)
      ]
    ),

    // Fecha de nacimiento (campo tipo date)
    birthDate: new FormControl(
      '',
      Validators.required  // Solo un validador, no necesita array
    ),

    destination: new FormControl('', Validators.required),
    departureDate: new FormControl('', Validators.required), //fecha salida
    returnDate: new FormControl('', Validators.required),
    tripType: new FormControl('', Validators.required),
    travelClass: new FormControl('', Validators.required), //clase de viaje: turisata...
    passengers: new FormControl(
      '',
      [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ]
    ),



    terms: new FormControl(//términos y condiciones
      false,  // valor inicial desmarcado
      Validators.requiredTrue  //true paa ser vaslido
    ),
    newsletter: new FormControl(false),  //no es required
    additionalPassengers: new FormArray([]) 
  });

  onSubmit(): void { // este metodo se ejecuta al nviar el form

    if (!this.bookingForm.valid) { //en caso de no ser valido 
      return;
    }

    console.log('RESERVA:', this.bookingForm.value); //imprimir x consola los valores del formulario

    alert('Reserva enviada correctament');
  }
  
  isFieldInvalid(field: string): boolean { //compribar si el campo act es valido 
    
    const control = this.bookingForm.get(field); //obtiene form especifico y busca el control por el nombre
    
    return !!( //convierte el valor en boolean -_> !!
      control && control.invalid && control.touched// Devuelve true solo si se cumplen las 3 condiciones
    );
  }
  
  getErrorMessage(field: string): string { //devuelve el mensage de error
    const control = this.bookingForm.get(field); //pillar el control especifico

    if (!control?.errors || !control.touched) { //no hay mensage de error
      return '';  // String vacío: no hay mensaje de error
    }

    // Comprobar cada tipo de error posible
    if (control.errors['required']) {
      return 'Aquest camp és obligatori';
    }

    if (control.errors['requiredTrue']) {
      return 'Has de acceptar les condicions';
    }

    if (control.errors['email']) {
      return 'Format de email incorrecte';
    }

    // Para errores con valores específicos
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

    if (control.errors['emailExists']) { 
      return 'Aquest email ja està registrat';
    }

    return 'Error de validació'; //si nada de lo anterior Funca
  }

  searchControl: FormControl = new FormControl(''); //control aparte para el filtro (fuera form inicial)

  filteredDestinations: string[] = this.destinations; //array con destinos filtrados

  
  constructor() { //carregar al moment les funcions de busqueda
    this.setupDestinationFilter();
    this.setupPassengersSync();
    this.calculatePrice();
  }

  
  setupDestinationFilter(): void {
    
    this.searchControl.valueChanges.subscribe( //escucha los cambios al momento
      (searchTerm: string) => {
        if (!searchTerm) {
          this.filteredDestinations = this.destinations; // mostrar todos los Destinos
          return;
        }
        
        this.filteredDestinations = this.destinations.filter( //este metodo crea un nuevo array qie contiene los elementos ya filtrados (cumplen condicion)
          dest =>dest.toLowerCase().includes(searchTerm.toLowerCase())//miarar dest, pasar min, comprobar si cont el texto en min
        );
      }
    );
  }

  get additionalPassengers(): FormArray { //crear variable que devuelbe un formaArray
    return this.bookingForm.get('additionalPassengers') as FormArray; //obtener el formArray del formulario
  }

  get additionalPassengersGroups(): FormGroup[] { //retornar aditional passangers com a formgroup
    return this.additionalPassengers.controls as FormGroup[];
  }

  createPassengerGroup(): FormGroup { //crea el pasagero especifico con sus campos
    return new FormGroup({ 

      name: new FormControl(
        '', //valor defecto
        [Validators.required, Validators.minLength(3)]
      ),

      age: new FormControl(
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.max(120)
        ]
      ),
      
      relationship: new FormControl('', Validators.required)
    });
  }

  adjustPassengers(count: number): void { //recibe num total de pasageros
    const currentLength = this.additionalPassengers.length;
    const needed = count - 1;

    if (needed <= 0) {
      this.additionalPassengers.clear();
      return;
    }


    if (needed > currentLength) { //por si se necesitan mas pasageros
      for (let i = currentLength; i < needed; i++) {
        this.additionalPassengers.push( //añadoir campo al final (nuevo pasagero)
          this.createPassengerGroup()  // Crear nuevo FormGroup
        );
      }
    } 
    else if (needed < currentLength) {
      for (let i = currentLength; i > needed; i--) {
        this.additionalPassengers.removeAt(i - 1);
      }
    }
  }
  
  setupPassengersSync(): void { //sincroniza num pasageros
    this.bookingForm.get('passengers')?.valueChanges.subscribe( //escucha el campo de pasageros
      value => { //new valor 
        const count = parseInt(value) || 0; //convertir string a entero
        this.adjustPassengers(count); //ajustar pasangers
      }
    );
  }

  emailExistsValidator(): AsyncValidatorFn { 
    return (control): Observable<ValidationErrors | null> => {
      
      if (!control.value) {
        return of(null); //crear observavle que emite el null
      }
      const existingEmails = [
        'test@test.com',
        'reserva@viajes.com',
        'admin@travel.com'
      ];

      return of(control.value).pipe( //simular peticion HTTP, crear observabke  y encadenar
        delay(1000), //esperar 1 seg
        map(email => { //transform valor emitido 
          const exists = existingEmails.includes(email.toLowerCase()); //comprobar si array contiene el elemento
          return exists ? { emailExists: true } : null; // si existe devolver err, si no valido 
        })
      );
    };
  }

  get emailValidating(): boolean { //indica si el email esta siendkl validado
    const emailControl = this.bookingForm.get('email');
    return emailControl?.status === 'PENDING'; //durante validacion === Pendin
  }

  totalPrice: number = 0;

  calculatePrice(): void {
    this.bookingForm.valueChanges.subscribe(() => { //escucha todos los campos del formulario completo
      
      const travelClass = this.bookingForm.get('travelClass')?.value;
      const passengers = parseInt(this.bookingForm.get('passengers')?.value) || 0;

      let basePrice = 0;
      
      if (travelClass === 'Turista') {
        basePrice = 100;
      } else if (travelClass === 'Business') {
        basePrice = 250;
      } else if (travelClass === 'Primera classe') {
        basePrice = 500;
      }

      this.totalPrice = basePrice * passengers;
    });
  }
}