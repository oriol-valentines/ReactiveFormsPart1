// ============================================
// IMPORTACIONES - Traer funcionalidades de Angular
// ============================================

// CommonModule: proporciona directivas básicas como *ngIf, *ngFor
// NgClass: directiva para añadir/quitar clases CSS dinámicamente
import { CommonModule, NgClass } from '@angular/common';

// Component: decorador que convierte una clase en un componente de Angular
import { Component } from '@angular/core';

// ReactiveFormsModule: módulo necesario para usar formularios reactivos
import { ReactiveFormsModule } from '@angular/forms';

// FormGroup: agrupa varios FormControl en un formulario
// FormControl: representa un campo individual del formulario
// Validators: funciones de validación predefinidas (required, email, min, max...)
// FormArray: array dinámico de FormControl o FormGroup
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

// ===== IMPORTACIONES PARA VALIDACIÓN ASÍNCRONA =====
// AsyncValidatorFn: tipo de dato para validadores asíncronos
// ValidationErrors: tipo que representa errores de validación
import { AsyncValidatorFn, ValidationErrors } from '@angular/forms';

// Observable: objeto que emite valores a lo largo del tiempo (programación reactiva)
// of: función que crea un Observable a partir de un valor
import { Observable, of } from 'rxjs';

// delay: operador que añade un retraso temporal
// map: operador que transforma el valor emitido por un Observable
import { delay, map } from 'rxjs/operators';

// ============================================
// DECORADOR @Component - Configuración del componente
// ============================================
@Component({
  // selector: etiqueta HTML que representa este componente
  // Usarás <app-booking></app-booking> en otros templates
  selector: 'app-booking',
  
  // imports: módulos necesarios para que funcione este componente standalone
  // (Angular 17+ permite componentes standalone sin necesidad de NgModule)
  imports: [CommonModule, ReactiveFormsModule, NgClass],
  
  // templateUrl: ruta al archivo HTML que contiene la vista
  templateUrl: './booking.html',
  
  // styleUrl: ruta al archivo CSS con los estilos
  styleUrl: './booking.css',
})

// ============================================
// CLASE DEL COMPONENTE - Lógica del componente
// ============================================
export class Booking {
  // export: permite que otras partes de la aplicación importen esta clase
  // class: define una clase de TypeScript
  // Booking: nombre de la clase (por convención en PascalCase)

  // ============================================
  // PROPIEDADES - Variables del componente
  // ============================================

  // ===== ARRAY DE DESTINOS =====
  // destinations: nombre de la variable
  // string[]: tipo de dato → array de strings (textos)
  // = [...]: asignación del valor inicial
  destinations: string[] = [
    'Barcelona',   // Cada elemento es un string
    'Madrid',
    'Valencia',
    'Sevilla',
    'Bilbao',
    'Mallorca'
  ];
  // Este array se usa en el select de destinos

  // ============================================
  // FORMULARIO REACTIVO PRINCIPAL
  // ============================================
  
  // bookingForm: nombre de la variable que contiene el formulario
  // FormGroup: tipo de dato → grupo de controles
  // new: crea una nueva instancia
  // FormGroup({...}): constructor que recibe un objeto con los campos
  bookingForm: FormGroup = new FormGroup({
    // Cada propiedad del objeto es un campo del formulario

    // ===== SECCIÓN: DATOS DEL CLIENTE =====
    
    // fullName: nombre del campo (clave)
    // new FormControl(...): crea un nuevo control de formulario
    // Parámetros: (valorInicial, [validadoresSíncronos], [validadoresAsíncronos])
    fullName: new FormControl(
      '',  // Valor inicial: string vacío
      [    // Array de validadores síncronos (se ejecutan instantáneamente)
        Validators.required,  // Campo obligatorio
        Validators.minLength(3),  // Mínimo 3 caracteres
        Validators.pattern(  // Patrón regex: solo letras y espacios (incluyendo acentos)
          /^[a-zA-ZÀ-ÿ\s]+$/
          // ^ : inicio del string
          // [a-zA-ZÀ-ÿ\s] : cualquier letra (con acentos) o espacio
          // + : uno o más caracteres
          // $ : fin del string
        )
      ]
    ),

    // DNI/NIE con patrón específico español
    dni: new FormControl(
      '',  // Valor inicial vacío
      [
        Validators.required,
        Validators.pattern(/^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/i)
        // \d{8} : 8 dígitos
        // [A-Z] : una letra mayúscula
        // | : O (alternativa)
        // [XYZ] : letra X, Y o Z (para NIE)
        // \d{7} : 7 dígitos
        // [A-Z] : letra final
        // i : flag insensible a mayúsculas/minúsculas
      ]
    ),

    // ===== EMAIL CON VALIDACIÓN ASÍNCRONA =====
    // Nota los 3 parámetros: (inicial, síncronos, asíncronos)
    email: new FormControl(
      '',  // Primer parámetro: valor inicial
      [    // Segundo parámetro: array de validadores síncronos
        Validators.required,
        Validators.email  // Comprueba formato email (usuario@dominio.com)
      ],
      [    // Tercer parámetro: array de validadores asíncronos
        this.emailExistsValidator()  // Método personalizado (se define más abajo)
        // this: referencia a la instancia actual de la clase
        // .emailExistsValidator(): llama al método
        // (): ejecuta el método y devuelve el validador
      ]
    ),

    // Teléfono móvil español
    phone: new FormControl(
      '',
      [
        Validators.required,
        Validators.pattern(/^[679]\d{8}$/)
        // [679] : debe empezar por 6, 7 o 9
        // \d{8} : seguido de 8 dígitos más
        // Total: 9 dígitos
      ]
    ),

    // Fecha de nacimiento (campo tipo date)
    birthDate: new FormControl(
      '',
      Validators.required  // Solo un validador, no necesita array
    ),

    // ===== SECCIÓN: INFORMACIÓN DEL VIAJE =====

    // Destino seleccionado del select
    destination: new FormControl('', Validators.required),

    // Fecha de salida
    departureDate: new FormControl('', Validators.required),

    // Fecha de retorno
    returnDate: new FormControl('', Validators.required),

    // Tipo de viaje (radio button: ida o ida y vuelta)
    tripType: new FormControl('', Validators.required),

    // Clase de viaje (Turista, Business, Primera)
    travelClass: new FormControl('', Validators.required),

    // Número de pasajeros
    passengers: new FormControl(
      '',
      [
        Validators.required,
        Validators.min(1),   // Mínimo 1 pasajero
        Validators.max(10)   // Máximo 10 pasajeros
      ]
    ),

    // ===== SECCIÓN: CONDICIONES =====

    // Checkbox de términos y condiciones
    terms: new FormControl(
      false,  // Valor inicial: false (desmarcado)
      Validators.requiredTrue  // Debe estar marcado (true) para ser válido
    ),

    // Checkbox de newsletter (opcional)
    newsletter: new FormControl(false),  // Sin validadores

    // ===== FORMARRAY PARA PASAJEROS ADICIONALES =====
    // FormArray: array dinámico que puede crecer/decrecer
    additionalPassengers: new FormArray([])  // Inicialmente vacío []
    // Aquí se añadirán FormGroups dinámicamente
  });

  // ============================================
  // MÉTODO onSubmit - Se ejecuta al enviar el formulario
  // ============================================
  
  // onSubmit: nombre del método
  // (): no recibe parámetros
  // : void : tipo de retorno → no devuelve nada
  onSubmit(): void {

    // Comprobación de validez del formulario
    // if: estructura condicional
    // !: operador de negación (NOT)
    // this.bookingForm: acceso al formulario
    // .valid: propiedad booleana que indica si todo el formulario es válido
    if (!this.bookingForm.valid) {
      // Si el formulario NO es válido...
      return;  // Salir del método sin hacer nada
    }

    // Si llegamos aquí, el formulario es válido

    // console.log(): imprime en la consola del navegador (F12)
    // this.bookingForm.value: objeto con todos los valores del formulario
    console.log('RESERVA:', this.bookingForm.value);

    // alert(): muestra un cuadro de diálogo al usuario
    alert('Reserva enviada correctament');
  }

  // ============================================
  // MÉTODO isFieldInvalid - Comprueba si un campo es inválido
  // ============================================
  
  // (field: string): recibe un parámetro llamado 'field' de tipo string
  // : boolean : devuelve un valor booleano (true/false)
  isFieldInvalid(field: string): boolean {
    
    // const: declara una constante (valor que no cambiará)
    // control: nombre de la constante
    // this.bookingForm.get(field): obtiene el FormControl específico
    // get(): método que busca un control por su nombre
    const control = this.bookingForm.get(field);
    
    // return: devuelve un valor
    // !!: doble negación → convierte cualquier valor a booleano
    // &&: operador AND (Y lógico) → todas las condiciones deben cumplirse
    return !!(
      control  // Existe el control
      && control.invalid  // Y el control es inválido
      && control.touched  // Y el usuario ha tocado el campo
    );
    // Devuelve true solo si se cumplen las 3 condiciones
  }

  // ============================================
  // MÉTODO getErrorMessage - Devuelve el mensaje de error apropiado
  // ============================================
  
  getErrorMessage(field: string): string {
    // Obtener el control específico
    const control = this.bookingForm.get(field);

    // ?. : operador de encadenamiento opcional (optional chaining)
    // Si control es null/undefined, no da error, devuelve undefined
    // Si no hay errores o no se ha tocado, retornar string vacío
    if (!control?.errors || !control.touched) {
      return '';  // String vacío: no hay mensaje de error
    }

    // Comprobar cada tipo de error posible
    // control.errors: objeto con los errores del control
    // ['required']: acceso a la propiedad 'required' del objeto errors
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
      // Template literal: usa `` (backticks)
      // ${}: interpolación → inserta el valor de una variable
      return `Mínim ${control.errors['minlength'].requiredLength} caràcters`;
      // .requiredLength: propiedad dentro del error minlength
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

    // Error personalizado de validación asíncrona
    if (control.errors['emailExists']) {
      return 'Aquest email ja està registrat';
    }

    // Mensaje genérico si no coincide con ningún error conocido
    return 'Error de validació';
  }

  // ============================================
  // NUEVAS FUNCIONALIDADES
  // ============================================

  // ===== 1. FILTRO DE BÚSQUEDA DE DESTINOS =====

  // FormControl independiente (NO está en bookingForm)
  searchControl: FormControl = new FormControl('');

  // Array que contendrá los destinos filtrados
  // Inicialmente contiene todos los destinos
  filteredDestinations: string[] = this.destinations;

  // ============================================
  // CONSTRUCTOR - Se ejecuta al crear una instancia del componente
  // ============================================
  
  constructor() {
    // Configurar el filtro de destinos
    this.setupDestinationFilter();
    // this: referencia a la instancia actual
    // .setupDestinationFilter(): llama al método
    
    // Configurar sincronización automática de pasajeros
    this.setupPassengersSync();
    
    // Configurar cálculo automático de precio
    this.calculatePrice();
  }

  // ============================================
  // MÉTODO setupDestinationFilter - Configura el filtro de destinos
  // ============================================
  
  setupDestinationFilter(): void {
    
    // this.searchControl: el FormControl del campo de búsqueda
    // .valueChanges: Observable que emite cada vez que cambia el valor
    // .subscribe(): escuchar los cambios
    this.searchControl.valueChanges.subscribe(
      // Arrow function: (parámetro) => { código }
      (searchTerm: string) => {
        // searchTerm: el nuevo valor escrito en el campo
        
        // Si no hay texto de búsqueda (vacío, null, undefined)
        if (!searchTerm) {
          // Mostrar todos los destinos
          this.filteredDestinations = this.destinations;
          return;  // Salir de la función
        }
        
        // Filtrar destinos que contengan el texto buscado
        // .filter(): método de array que crea un nuevo array con elementos que cumplen la condición
        this.filteredDestinations = this.destinations.filter(
          // Para cada destino (dest), comprobar:
          dest =>
            dest  // el destino
            .toLowerCase()  // convertir a minúsculas
            .includes(  // comprobar si contiene
              searchTerm.toLowerCase()  // el texto buscado en minúsculas
            )
        );
        // Ejemplo: si buscas "bar", encontrará "Barcelona"
      }
    );
  }

  // ============================================
  // GETTERS - Propiedades calculadas (se acceden como propiedades pero son métodos)
  // ============================================

  // ===== 2. GETTER PARA FORMARRAY =====
  
  // get: palabra clave para definir un getter
  // additionalPassengers: nombre del getter (se usa como propiedad)
  // : FormArray : tipo que devuelve
  get additionalPassengers(): FormArray {
    // Obtener el FormArray del formulario
    // as FormArray: cast de tipo (afirmar que es un FormArray)
    return this.bookingForm.get('additionalPassengers') as FormArray;
  }
  // Ahora puedes usar: this.additionalPassengers en lugar de
  // this.bookingForm.get('additionalPassengers') as FormArray

  // Getter para obtener los grupos tipados
  get additionalPassengersGroups(): FormGroup[] {
    // .controls: array de AbstractControl dentro del FormArray
    // as FormGroup[]: cast a array de FormGroup
    return this.additionalPassengers.controls as FormGroup[];
  }

  // ============================================
  // MÉTODO createPassengerGroup - Crea un FormGroup para un pasajero
  // ============================================
  
  // : FormGroup : devuelve un FormGroup
  createPassengerGroup(): FormGroup {
    // return: devolver el nuevo FormGroup
    return new FormGroup({
      // Nombre del pasajero adicional
      name: new FormControl(
        '',
        [Validators.required, Validators.minLength(3)]
      ),
      
      // Edad del pasajero
      age: new FormControl(
        '',
        [
          Validators.required,
          Validators.min(0),    // Edad mínima: 0
          Validators.max(120)   // Edad máxima: 120
        ]
      ),
      
      // Relación con el titular
      relationship: new FormControl('', Validators.required)
    });
  }

  // ============================================
  // MÉTODO adjustPassengers - Ajusta el número de pasajeros en el FormArray
  // ============================================
  
  // (count: number): recibe el número total de pasajeros
  adjustPassengers(count: number): void {
    
    // Obtener longitud actual del FormArray
    // .length: propiedad que indica cuántos elementos hay
    const currentLength = this.additionalPassengers.length;
    
    // Calcular cuántos pasajeros adicionales se necesitan
    // count - 1 porque el primero es el titular
    const needed = count - 1;

    // Si needed es 0 o negativo, limpiar el array
    if (needed <= 0) {
      // .clear(): método que elimina todos los elementos del FormArray
      this.additionalPassengers.clear();
      return;
    }

    // Si necesitamos MÁS pasajeros de los que hay
    if (needed > currentLength) {
      // for: bucle que se repite
      // let i: variable contador
      // i = currentLength: empezar desde el número actual
      // i < needed: mientras i sea menor que needed
      // i++: incrementar i en 1 cada iteración
      for (let i = currentLength; i < needed; i++) {
        // .push(): añadir un elemento al final del array
        this.additionalPassengers.push(
          this.createPassengerGroup()  // Crear nuevo FormGroup
        );
      }
    } 
    // else if: si no, pero si...
    // Si necesitamos MENOS pasajeros
    else if (needed < currentLength) {
      // Eliminar desde el final
      for (let i = currentLength; i > needed; i--) {
        // .removeAt(índice): eliminar elemento en la posición indicada
        // i - 1: porque los índices empiezan en 0
        this.additionalPassengers.removeAt(i - 1);
      }
    }
    // Si needed === currentLength, no hacer nada
  }

  // ============================================
  // MÉTODO setupPassengersSync - Sincroniza el número de pasajeros
  // ============================================
  
  setupPassengersSync(): void {
    // Obtener el FormControl 'passengers'
    // ?. : si get() devuelve null, no da error
    // .valueChanges: Observable de cambios
    // .subscribe(): escuchar cambios
    this.bookingForm.get('passengers')?.valueChanges.subscribe(
      value => {  // value: nuevo valor del campo
        // parseInt(value): convertir string a número entero
        // || 0: si parseInt devuelve NaN (Not a Number), usar 0
        const count = parseInt(value) || 0;
        
        // Ajustar los pasajeros del FormArray
        this.adjustPassengers(count);
      }
    );
  }

  // ============================================
  // VALIDADOR ASÍNCRONO emailExistsValidator
  // ============================================
  
  // : AsyncValidatorFn : tipo de función validadora asíncrona
  emailExistsValidator(): AsyncValidatorFn {
    
    // Devolver una función (closure)
    // (control): el control a validar
    // : Observable<...> : devuelve un Observable
    // ValidationErrors | null: puede devolver errores o null (válido)
    return (control): Observable<ValidationErrors | null> => {
      
      // Si el control no tiene valor, no validar
      if (!control.value) {
        // of(null): crear Observable que emite null inmediatamente
        return of(null);
      }

      // Emails que simulan estar ya registrados en el sistema
      const existingEmails = [
        'test@test.com',
        'reserva@viajes.com',
        'admin@travel.com'
      ];

      // Simular petición HTTP asíncrona
      // of(control.value): crear Observable con el valor
      // .pipe(): encadenar operadores
      return of(control.value).pipe(
        // delay(1000): esperar 1000ms (1 segundo)
        delay(1000),
        
        // map(): transformar el valor emitido
        map(email => {
          // .includes(): comprobar si el array contiene el elemento
          // .toLowerCase(): convertir a minúsculas para comparar
          const exists = existingEmails.includes(email.toLowerCase());
          
          // Operador ternario: condición ? siVerdadero : siFalso
          // Si existe: devolver objeto con error
          // Si no existe: devolver null (válido)
          return exists ? { emailExists: true } : null;
        })
      );
    };
  }

  // ============================================
  // GETTER emailValidating - Indica si el email se está validando
  // ============================================
  
  // : boolean : devuelve true/false
  get emailValidating(): boolean {
    const emailControl = this.bookingForm.get('email');
    
    // .status: estado del control ('VALID', 'INVALID', 'PENDING', 'DISABLED')
    // === 'PENDING': comparación estricta
    // Durante la validación asíncrona, el estado es 'PENDING'
    return emailControl?.status === 'PENDING';
  }

  // ============================================
  // CÁLCULO DE PRECIO TOTAL
  // ============================================

  // Propiedad que almacena el precio total calculado
  // : number : tipo número
  // = 0 : valor inicial
  totalPrice: number = 0;

  // ============================================
  // MÉTODO calculatePrice - Calcula el precio automáticamente
  // ============================================
  
  calculatePrice(): void {
    
    // Escuchar TODOS los cambios del formulario completo
    // this.bookingForm.valueChanges: Observable que emite cuando cualquier campo cambia
    this.bookingForm.valueChanges.subscribe(() => {
      
      // Obtener clase de viaje seleccionada
      const travelClass = this.bookingForm.get('travelClass')?.value;
      
      // Obtener número de pasajeros
      // parseInt(): convertir a número
      // || 0: si es NaN, usar 0
      const passengers = parseInt(this.bookingForm.get('passengers')?.value) || 0;

      // Variable para el precio base
      // let: variable que puede cambiar
      let basePrice = 0;
      
      // Determinar precio según la clase
      // === : comparación estricta (valor y tipo)
      if (travelClass === 'Turista') {
        basePrice = 100;
      } else if (travelClass === 'Business') {
        basePrice = 250;
      } else if (travelClass === 'Primera classe') {
        basePrice = 500;
      }

      // Calcular precio total
      // * : operador de multiplicación
      this.totalPrice = basePrice * passengers;
      // Este valor se actualiza automáticamente en la vista
    });
  }

} // Fin de la clase Booking