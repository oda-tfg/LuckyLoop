import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Importaciones para CodeMirror
import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/selection/active-line';

@Component({
  selector: 'app-programa-y-gana',
  templateUrl: './programa-y-gana.component.html',
  standalone:false,
  styleUrls: ['./programa-y-gana.component.css']
})
export class ProgramaYGanaComponent implements OnInit {
  form: FormGroup;
  codigoUsuario: string = 'print("Hola, mundo!")';
  
  languages = [
    { name: 'Python', value: 'python', mode: 'python' },
    { name: 'JavaScript', value: 'javascript', mode: 'javascript' },
    { name: 'C++', value: 'cpp', mode: 'text/x-c++src' }
  ];

  editorOptions = {
    lineNumbers: true,
    theme: 'material',
    mode: 'python',
    indentWithTabs: false,
    smartIndent: true,
    lineWrapping: false,
    extraKeys: { "Tab": "defaultTab" },
    gutters: ["CodeMirror-linenumbers"],
    autoCloseBrackets: true,
    matchBrackets: true,
    styleActiveLine: true
  };
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      language: ['python', Validators.required],
      bet: [10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.form.get('language')?.valueChanges.subscribe(lang => {
      const selectedLang = this.languages.find(l => l.value === lang);
      if (selectedLang) {
        this.editorOptions = { ...this.editorOptions, mode: selectedLang.mode };
      }
    });
  }

  onCodeChange(code: string): void {
    this.codigoUsuario = code;
  }

  onSubmit() {
    if (this.form.valid) {
      const payload = {
        language: this.form.value.language,
        bet: this.form.value.bet,
        code: this.codigoUsuario
      };
      console.log('Payload enviado:', payload);
    }
  }
}