# Flujo Clínico del Paciente - CardioFlow

Este diagrama representa el ciclo de vida de un paciente en el sistema, los roles involucrados y las transiciones de estado.

```mermaid
stateDiagram-v2
    state "Pendiente de triaje" as PendienteDeTriaje
    state "Listo para evaluación" as ListoParaEvaluacion
    state "Derivado a cardiología" as DerivadoACardiologia
    state "Cerrado" as Cerrado

    [*] --> PendienteDeTriaje : Nuevo ingreso (Recepción/Enfermería)

    note right of PendienteDeTriaje
        Rol: Enfermería
        Acción: Completar triaje
    end note

    PendienteDeTriaje --> ListoParaEvaluacion : Confirmar triaje

    note right of ListoParaEvaluacion
        Rol: Médico clínico
        Acción: Registrar conducta
    end note

    ListoParaEvaluacion --> DerivadoACardiologia : Derivar a cardiología
    ListoParaEvaluacion --> Cerrado : Cerrar con control

    note right of DerivadoACardiologia
        Rol: Cardiología
        Acción: Registrar resolución
    end note

    DerivadoACardiologia --> Cerrado : Cerrar caso

    note right of Cerrado
        Estado final del caso
        Consulta posterior: Coordinación clínica
    end note

    Cerrado --> [*]
```

## Roles y Acciones

1. **Enfermería**: 
   - **Estado:** Pendiente de triaje
   - **Acción:** `Completar triaje`
   - **Transición:** Genera evento "Triaje completado" y avanza a "Listo para evaluación".
2. **Médico Clínico**: 
   - **Estado:** Listo para evaluación
   - **Acción:** `Registrar conducta`
   - **Transición:** Puede **derivar a cardiología** si el caso requiere evaluación especializada, o **cerrar con control** si no considera necesaria la derivación.
3. **Cardiología**: 
   - **Estado:** Derivado a cardiología
   - **Acción:** `Registrar resolución`
   - **Transición:** Genera evento "Resolución cardiológica registrada" y avanza a "Cerrado".
4. **Coordinación Clínica**:
   - **Estado:** Cerrado
   - **Acción:** `Ver cierre` (Solo lectura; no modifica el flujo clínico, sino que permite consultar el historial del caso).
