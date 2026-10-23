// Virtual files are combined for CodePen, with their imports shared here.
import '@angular/compiler'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  Injector,
  Input,
  forwardRef,
  inject,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { JsonPipe } from '@angular/common'
import { bootstrapApplication } from '@angular/platform-browser'
import {
  ControlContainer,
  type ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  type ValidationErrors,
  type Validator,
  Validators,
} from '@angular/forms'
import {
  DateAdapter,
  type ErrorStateMatcher,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS,
  NativeDateAdapter,
} from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatDatepickerModule } from '@angular/material/datepicker'

// dutch-date-adapter.ts
@Injectable()
class DutchDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (value == null || value === '') return null
    if (value instanceof Date) return this.clone(value)
    if (typeof value !== 'string') return this.invalid()

    const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim())
    if (!match) return this.invalid()

    const [, day, month, year] = match.map(Number)
    const date = new Date(0)
    date.setFullYear(year, month - 1, day)
    date.setHours(0, 0, 0, 0)

    // Date normalizes overflow, so check every part before accepting it.
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
      ? date
      : this.invalid()
  }

  override format(date: Date, displayFormat: object | 'dutch-date'): string {
    if (displayFormat !== 'dutch-date') return super.format(date, displayFormat)

    return [
      String(date.getDate()).padStart(2, '0'),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getFullYear()).padStart(4, '0'),
    ].join('-')
  }
}

// date-control.ts
@Component({
  selector: 'app-date-control',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateControl),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateControl),
      multi: true,
    },
  ],
  template: `
    <!-- date-control.html -->
    <mat-form-field appearance="outline">
      <mat-label>{{ label }}</mat-label>
      <input matInput [matDatepicker]="picker" [formControl]="date"
        placeholder="DD-MM-YYYY" [required]="required"
        [errorStateMatcher]="errorMatcher" (blur)="onTouched()">
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker (closed)="onTouched()" />
      <mat-error>Enter a valid date in DD-MM-YYYY format.</mat-error>
    </mat-form-field>
  `,
})
class DateControl implements ControlValueAccessor, Validator {
  @Input() label = ''

  private readonly injector = inject(Injector)
  private readonly destroyRef = inject(DestroyRef)
  private readonly parentForm = inject(FormGroupDirective, { optional: true })

  ngControl: NgControl | null = null
  readonly date = new FormControl<Date | null>(null)
  onChange: (value: Date | null) => void = () => {}
  onTouched: () => void = () => {}
  private onValidatorChange: () => void = () => {}

  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: () => {
      const control = this.ngControl?.control
      return !!(
        control?.invalid &&
        (control.touched || this.parentForm?.submitted)
      )
    },
  }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, { self: true })
    this.date.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.onChange(value))
    this.date.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onValidatorChange())
  }

  get required(): boolean {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false
  }

  writeValue(value: Date | null): void {
    this.date.reset(value, { emitEvent: false })
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn
  }

  setDisabledState(disabled: boolean): void {
    if (disabled) this.date.disable({ emitEvent: false })
    else this.date.enable({ emitEvent: false })
  }

  validate(): ValidationErrors | null {
    return this.date.invalid ? { date: this.date.errors } : null
  }
}

// field.ts
type Field = { name: string; label: string; type: 'date' }

// dynamic-fields.ts
@Component({
  selector: 'app-dynamic-fields',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ReactiveFormsModule, DateControl],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  template: `
    <!-- dynamic-fields.html -->
    @for (field of fields; track field.name) {
      <app-date-control [formControlName]="field.name" [label]="field.label" />
    }
  `,
})
class DynamicFields {
  @Input() fields: Field[] = []
}

// app.ts
@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, DynamicFields, JsonPipe, MatButtonModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'nl-NL' },
    { provide: DateAdapter, useClass: DutchDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        ...MAT_NATIVE_DATE_FORMATS,
        display: {
          ...MAT_NATIVE_DATE_FORMATS.display,
          dateInput: 'dutch-date',
        },
      },
    },
  ],
  template: `
    <!-- app.html -->
    <main class="demo-shell">
      <p class="demo-eyebrow">Angular · Material · Reactive Forms · NgControl</p>
      <h1>Type a date. Or pick one.</h1>
      <p class="demo-intro">The same nested form, with one date control.
        Type a date or choose one from the calendar.</p>

      <form [formGroup]="form" #formDirective="ngForm">
        <div formGroupName="appointment"><app-dynamic-fields [fields]="fields" /></div>
        <div class="actions">
          <button mat-flat-button type="button" (click)="form.markAllAsTouched()"
            [disabled]="form.disabled">Validate</button>
          <button mat-stroked-button type="button" (click)="formDirective.resetForm()">Reset</button>
          <button mat-stroked-button type="button" (click)="fill()">Fill example</button>
          <button mat-stroked-button type="button" (click)="toggleDisabled()">
            {{ form.disabled ? 'Enable' : 'Disable' }} form
          </button>
        </div>
      </form>

      <section class="demo-panel" aria-label="Form state" aria-live="polite">
        <p class="demo-status">{{ form.status }} · {{ form.dirty ? 'dirty' : 'pristine' }} ·
          {{ form.touched ? 'touched' : 'untouched' }}</p>
        <pre>{{ form.getRawValue() | json }}</pre>
        <p class="demo-note">The form holds a Date object. JSON displays it in UTC;
          the input displays the local date. Send the local year, month and day
          if your API expects a date without a time.</p>
      </section>
    </main>
  `,
})
class App {
  readonly fields: Field[] = [{ name: 'date', label: 'Date', type: 'date' }]
  readonly form = new FormGroup({
    appointment: new FormGroup({
      date: new FormControl<Date | null>(null, Validators.required),
    }),
  })

  fill(): void {
    this.form.patchValue({ appointment: { date: new Date(2026, 9, 25) } })
  }

  toggleDisabled(): void {
    if (this.form.disabled) this.form.enable()
    else this.form.disable()
  }
}

// main.ts
bootstrapApplication(App).catch(console.error)
