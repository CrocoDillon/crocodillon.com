import '@angular/compiler'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
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
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms'
import {
  ErrorStateMatcher,
  provideNativeDateAdapter,
} from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatTimepickerModule } from '@angular/material/timepicker'

function controlProviders(getType: () => unknown) {
  return [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(getType),
      multi: true,
    },
    { provide: NG_VALIDATORS, useExisting: forwardRef(getType), multi: true },
  ]
}

@Directive()
abstract class TemporalControl implements ControlValueAccessor, Validator {
  @Input() label = ''
  abstract readonly kind: 'date' | 'time' | 'datetime'
  private readonly injector = inject(Injector)
  private readonly destroyRef = inject(DestroyRef)
  private readonly parentForm = inject(FormGroupDirective, { optional: true })
  ngControl: NgControl | null = null
  readonly parts = new FormGroup({
    date: new FormControl<Date | null>(null),
    time: new FormControl<Date | null>(null),
  })
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
    // Resolve after construction to avoid a cycle with our accessor/validator providers.
    this.ngControl = this.injector.get(NgControl, null, { self: true })
    this.parts.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.onChange(this.readValue())
      })
    this.parts.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.onValidatorChange()
      })
  }
  get required(): boolean {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false
  }
  writeValue(value: Date | null): void {
    const date =
      value instanceof Date && !Number.isNaN(value.getTime()) ? value : null
    this.parts.reset(
      {
        date: this.kind !== 'time' && date ? new Date(date) : null,
        time: this.kind !== 'date' && date ? new Date(date) : null,
      },
      { emitEvent: false }
    )
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
    if (disabled) this.parts.disable({ emitEvent: false })
    else this.parts.enable({ emitEvent: false })
  }
  validate(): ValidationErrors | null {
    const { date, time } = this.parts.controls
    if (this.kind !== 'time' && date.invalid) return { date: date.errors }
    if (this.kind !== 'date' && time.invalid) return { time: time.errors }
    if (this.kind === 'datetime' && !!date.value !== !!time.value)
      return { incompleteDateTime: true }
    if (
      this.kind === 'datetime' &&
      date.value &&
      time.value &&
      !this.readValue()
    )
      return { invalidLocalTime: true }
    return null
  }
  private readValue(): Date | null {
    const { date, time } = this.parts.getRawValue()
    if (this.kind === 'date') return date ? new Date(date) : null
    if (this.kind === 'time') return time ? new Date(time) : null
    if (!date || !time) return null
    const combined = new Date(date)
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0)
    // Reject nonexistent local times normalized across a spring-forward DST gap.
    if (
      combined.getHours() !== time.getHours() ||
      combined.getMinutes() !== time.getMinutes()
    )
      return null
    return combined
  }
}

const pickerImports = [
  ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatTimepickerModule,
]
const pickerTemplate = `
  <div class="picker-fields">
    @if (kind !== 'time') {
      <mat-form-field appearance="outline">
        <mat-label>{{ kind === 'datetime' ? label + ' · date' : label }}</mat-label>
        <input matInput [matDatepicker]="datePicker" [formControl]="parts.controls.date"
          [required]="required" [errorStateMatcher]="errorMatcher" (blur)="onTouched()">
        <mat-datepicker-toggle matIconSuffix [for]="datePicker" />
        <mat-datepicker #datePicker (closed)="onTouched()" />
        <mat-error>Enter a valid {{ label.toLowerCase() }}.</mat-error>
      </mat-form-field>
    }
    @if (kind !== 'date') {
      <mat-form-field appearance="outline">
        <mat-label>{{ kind === 'datetime' ? label + ' · time' : label }}</mat-label>
        <input matInput [matTimepicker]="timePicker" [formControl]="parts.controls.time"
          [required]="required" [errorStateMatcher]="errorMatcher" (blur)="onTouched()">
        <mat-timepicker-toggle matIconSuffix [for]="timePicker" />
        <mat-timepicker #timePicker interval="15m" (closed)="onTouched()" />
        <mat-error>Enter a valid {{ label.toLowerCase() }}.</mat-error>
      </mat-form-field>
    }
  </div>
`

@Component({
  selector: 'app-date-control',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: pickerImports,
  providers: controlProviders(() => DateControl),
  template: pickerTemplate,
})
class DateControl extends TemporalControl {
  readonly kind = 'date' as const
}
@Component({
  selector: 'app-time-control',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: pickerImports,
  providers: controlProviders(() => TimeControl),
  template: pickerTemplate,
})
class TimeControl extends TemporalControl {
  readonly kind = 'time' as const
}
@Component({
  selector: 'app-datetime-control',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: pickerImports,
  providers: controlProviders(() => DateTimeControl),
  template: pickerTemplate,
})
class DateTimeControl extends TemporalControl {
  readonly kind = 'datetime' as const
}

type Field = { name: string; label: string; type: 'date' | 'time' | 'datetime' }
@Component({
  selector: 'app-dynamic-fields',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ReactiveFormsModule, DateControl, TimeControl, DateTimeControl],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  template: `
    @for (field of fields; track field.name) {
      @switch (field.type) {
        @case ('date') { <app-date-control [formControlName]="field.name" [label]="field.label" /> }
        @case ('time') { <app-time-control [formControlName]="field.name" [label]="field.label" /> }
        @case ('datetime') { <app-datetime-control [formControlName]="field.name" [label]="field.label" /> }
      }
    }
  `,
})
class DynamicFields {
  @Input() fields: Field[] = []
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, DynamicFields, JsonPipe, MatButtonModule],
  providers: [provideNativeDateAdapter()],
  template: `
    <main class="demo-shell">
      <p class="demo-eyebrow">Angular · Material · reactive forms · NgControl</p>
      <h1>Three controls. One form.</h1>
      <p class="demo-intro">Material Datepicker and Timepicker, with both combined into
        a single datetime control. Nested forms, without passing controls down.</p>
      <form [formGroup]="form" (ngSubmit)="form.markAllAsTouched()" #formDirective="ngForm">
        <!-- Keep formGroupName on an ancestor of the forwarding component. -->
        <div formGroupName="appointment"><app-dynamic-fields [fields]="fields" /></div>
        <div class="actions">
          <button mat-flat-button type="submit" [disabled]="form.disabled">Validate</button>
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
        <p class="demo-note">Values are Date objects. JSON displays them in UTC.
          Date/time-only fields use only their relevant local parts.</p>
      </section>
    </main>
  `,
})
class App {
  readonly fields: Field[] = [
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'time', label: 'Time', type: 'time' },
    { name: 'datetime', label: 'Appointment', type: 'datetime' },
  ]
  readonly form = new FormGroup({
    appointment: new FormGroup({
      date: new FormControl<Date | null>(null, Validators.required),
      time: new FormControl<Date | null>(null, Validators.required),
      datetime: new FormControl<Date | null>(null, Validators.required),
    }),
  })
  fill(): void {
    this.form.patchValue({
      appointment: {
        date: new Date(2026, 9, 24),
        time: new Date(2026, 9, 24, 9, 30),
        datetime: new Date(2026, 9, 24, 9, 30),
      },
    })
  }
  toggleDisabled(): void {
    if (this.form.disabled) this.form.enable()
    else this.form.disable()
  }
}
bootstrapApplication(App).catch(console.error)
