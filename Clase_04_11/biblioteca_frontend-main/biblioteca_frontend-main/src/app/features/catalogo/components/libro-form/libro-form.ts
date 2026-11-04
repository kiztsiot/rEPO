import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LibroRequest, REGLAS_LIBRO } from '../../../../core/models/libro.model';

/** Formulario (en un diálogo) para agregar un libro. Las validaciones repiten las del DTO del backend. */
@Component({
  selector: 'app-libro-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './libro-form.html',
  styleUrl: './libro-form.css',
})
export class LibroForm {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly guardando = input(false);

  readonly guardar = output<LibroRequest>();
  readonly cancelar = output<void>();

  protected readonly reglas = REGLAS_LIBRO;

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(REGLAS_LIBRO.tituloMaxLargo)]],
    autor: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(REGLAS_LIBRO.autorMaxLargo)]],
    isbn: ['', [Validators.required, Validators.pattern(REGLAS_LIBRO.isbnPatron)]],
    categoria: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(REGLAS_LIBRO.categoriaMaxLargo)]],
    anioPublicacion: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(REGLAS_LIBRO.anioMin), Validators.max(REGLAS_LIBRO.anioMax)],
    ],
    ejemplares: [
      1,
      [Validators.required, Validators.min(REGLAS_LIBRO.ejemplaresMin), Validators.max(REGLAS_LIBRO.ejemplaresMax)],
    ],
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardar.emit({
      titulo: v.titulo.trim(),
      autor: v.autor.trim(),
      isbn: v.isbn.trim(),
      categoria: v.categoria.trim(),
      anioPublicacion: Number(v.anioPublicacion),
      ejemplares: Number(v.ejemplares),
    });
  }
}
