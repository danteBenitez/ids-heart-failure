# Sistema de Soporte a Decisiones Clínicas - Insuficiencia Cardíaca

Este proyecto es una aplicación web interactiva desarrollada en **Next.js** que materializa la **fase de Despliegue** en el ciclo de vida de la metodología **CRISP-DM**, aplicada a un modelo de Machine Learning entrenado para la predicción de riesgo de enfermedades cardiovasculares.

---

## Arquitectura y Flujo Clínico (Fase de Despliegue CRISP-DM)

### 1. Propósito del Software
En la metodología CRISP-DM, los modelos matemáticos predictivos (tales como *Random Forest* o *Regresión Logística*) alcanzan su máximo valor cuando se integran operativamente en la toma de decisiones diaria. Esta aplicación actúa como el **puente de despliegue** fundamental, traduciendo una probabilidad predictiva de riesgo cardiovascular en una interfaz de usuario interactiva y estructurada para los profesionales de la salud en un entorno clínico real.

### 2. Flujo de Datos y Roles (RBAC)
El sistema organiza el proceso de seguimiento clínico en un circuito secuencial estructurado por roles (Role-Based Access Control):
*   **Enfermería (Triage e Ingreso):** Es el punto de entrada de datos. Se encarga del ingreso del paciente y la recolección de las **11 variables clínicas** clave requeridas por el modelo predictivo (ej. edad, sexo, tipo de dolor torácico, presión arterial en reposo, colesterol, glucemia en ayunas, frecuencia cardíaca máxima, entre otras). Al confirmar el triage, las variables clínicas alimentan el motor de inferencia.
*   **Médico Clínico (Evaluación y Conducta):** Visualiza los resultados estimados del modelo de Machine Learning (porcentaje de riesgo y factores principales de influencia). En base a esto y a su propio juicio profesional, registra la conducta médica: puede derivar el paciente a cardiología especializada o cerrar el caso con controles de rutina.
*   **Cardiología (Confirmación y Cierre):** Recibe los casos con sospecha priorizada. Registra la confirmación diagnóstica definitiva (presencia o ausencia de enfermedad cardíaca), añade notas especializadas de tratamiento y cierra el circuito clínico del caso.

### 3. Seguridad y Persistencia (Arquitectura de la Demo)
Como demostración tecnológica funcional y robusta, la aplicación utiliza una arquitectura moderna orientada a la extensibilidad y seguridad:
*   **Zustand con Persistencia:** El estado global de la aplicación se gestiona mediante un store de **Zustand** utilizando el middleware `persist`, almacenando de manera reactiva la base de datos simulada localmente en el `localStorage` del navegador del usuario bajo la clave `"ids-hf:patients"`.
*   **Capa de Servicios Asíncronos (`PatientService`):** Toda la lógica de negocio y las mutaciones de datos están desacopladas en una capa de servicios asíncronos independiente (`PatientService`). Esto aísla a los componentes de presentación y prepara una transición limpia a una base de datos física real (como SQLite o PostgreSQL) reemplazando únicamente el adaptador de servicios.
*   **Seguridad "Zero-Trust" en el Frontend:** Para proteger el historial clínico del paciente en entornos compartidos, las reglas de permisos se derivan internamente comparando el estado real del flujo (`nextRole`) con el rol activo, en lugar de confiar en variables transitorias en la URL. Esto impide que la alteración de parámetros en la barra de direcciones desbloquee acciones de escritura no autorizadas, garantizando que el historial clínico permanezca siempre en modo de solo lectura.

---

## Comenzando

### Instalación de dependencias

Primero, instala las dependencias del proyecto utilizando **pnpm** (o el gestor de paquetes de tu preferencia):

```bash
pnpm install
# o
npm install
# o
yarn install
```

### Servidor de desarrollo

Una vez instaladas las dependencias, inicia el servidor de desarrollo localmente:

```bash
pnpm dev
# o
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación activa.
