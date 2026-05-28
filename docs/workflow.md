# Flujo Clínico del Paciente - CardioFlow

Este diagrama representa el ciclo de vida de un paciente en el sistema, los roles involucrados y las transiciones de estado.

```mermaid
stateDiagram-v2
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef enfermeria fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    classDef medico fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#b45309;
    classDef cardiologia fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#b91c1c;
    classDef coordinacion fill:#f3f4f6,stroke:#4b5563,stroke-width:2px,color:#374151;

    [*] --> PendienteDeTriaje : Nuevo ingreso (Recepción/Enfermería)

    state PendienteDeTriaje {
        direction LR
        AccionEnf: Completar triaje
        AccionEnf ::: enfermeria
    }
    
    PendienteDeTriaje --> ListoParaEvaluacion : Confirmar triaje

    state ListoParaEvaluacion {
        direction LR
        AccionMed: Evaluar con el modelo
        AccionMed ::: medico
    }
    
    ListoParaEvaluacion --> DerivadoACardiologia : Registrar evaluación

    state DerivadoACardiologia {
        direction LR
        AccionCardio: Registrar resolución
        AccionCardio ::: cardiologia
    }
    
    DerivadoACardiologia --> Cerrado : Cerrar caso

    state Cerrado {
        direction LR
        AccionCoord: Ver cierre
        AccionCoord ::: coordinacion
    }

    Cerrado --> [*]
```

## Roles y Acciones

1. **Enfermería**: 
   - **Estado:** Pendiente de triaje
   - **Acción:** `Completar triaje`
   - **Transición:** Genera evento "Triaje completado" y avanza a "Listo para evaluación".
2. **Médico Clínico**: 
   - **Estado:** Listo para evaluación
   - **Acción:** `Evaluar con el modelo`
   - **Transición:** Genera evento "Evaluación médica registrada" y avanza a "Derivado a cardiología".
3. **Cardiología**: 
   - **Estado:** Derivado a cardiología
   - **Acción:** `Registrar resolución`
   - **Transición:** Genera evento "Resolución cardiológica registrada" y avanza a "Cerrado".
4. **Coordinación Clínica**:
   - **Estado:** Cerrado
   - **Acción:** `Ver cierre` (Solo lectura, el ciclo finaliza aquí).
