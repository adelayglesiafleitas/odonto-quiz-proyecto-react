// src/data/academiaTema2Epilepsia.ts
//
// 2026-09-30 — Preguntas del Tema 2 del Capítulo 1 (docx "Epilepsia en
// Odontología — Batería de Preguntas"): 15 preguntas, 4 opciones, en el orden
// del docx. La justificación de la clave va como `feedback` (sin las
// referencias numéricas). En el docx 13 de 15 claves eran la B, así que el
// orden de las opciones se barajó con semilla fija (2026); el contenido de
// cada opción no cambió.
// Uso (ver academiaInmaculada.ts): pausas del vídeo del Tema 2 → preguntas
// 5 y 14; prueba final → preguntas 2, 8 y 13.

import type { PreguntaAcademia } from './academiaInmaculada'

export const PREGUNTAS_TEMA2_EPI: PreguntaAcademia[] = [
  // 1
  {
    pregunta: "¿En qué condición se considera que la epilepsia está \"activa\" en la historia clínica del paciente y qué pruebas hematológicas deben solicitarse si recibe valproato sódico o carbamazepina?",
    opciones: [
      "Se considera activa si ocurrió en los últimos 5 años; se solicita un perfil hepático y proteico completo.",
      "Se considera activa solo en epilepsias refractarias; se solicitan electrolitos séricos y creatinina.",
      "Se considera activa si ocurrió en el último mes; se solicita hemograma completo y glucemia en ayunas.",
      "Se considera activa si la crisis ocurrió en el último año; se solicitan pruebas de coagulación (tiempo de sangría, TP y TTPA) por riesgo de alteración plaquetaria.",
    ],
    correcta: 3,
    feedback: "La epilepsia se considera activa si ocurrió en el último año. Con valproato o carbamazepina deben solicitarse tiempo de sangría, TP y TTPA por alteración plaquetaria.",
  },
  // 2
  {
    pregunta: "¿Cuál es la manifestación bucal secundaria más característica provocada por el uso continuado de anticonvulsivos como la fenitoína (hidantoínas)?",
    opciones: [
      "Atrofia de papilas linguales y descamación mucosa.",
      "Pigmentación intrínseca verdosa en el esmalte dental.",
      "Osteonecrosis espontánea de los maxilares.",
      "Agrandamiento e hiperplasia gingival, acentuada por la acumulación de placa bacteriana.",
    ],
    correcta: 3,
    feedback: "La hiperplasia o agrandamiento gingival es el efecto adverso más común de las hidantoínas/fenitoína, agravado por la placa.",
  },
  // 3
  {
    pregunta: "¿A qué factor se atribuye principalmente la elevada prevalencia de caries en niños epilépticos dentro de los efectos secundarios del tratamiento farmacológico?",
    opciones: [
      "Al uso prolongado de colutorios con clorhexidina sin alcohol.",
      "A la ingesta continuada de jarabes antiepilépticos de consistencia viscosa y alto contenido en sacarosa.",
      "A la falta congénita de esmalte en la dentición primaria.",
      "A la prescripción habitual de antiinflamatorios no esteroideos.",
    ],
    correcta: 1,
    feedback: "Los jarabes anticonvulsivos pediátricos son viscosos y ricos en sacarosa, provocando alta prevalencia de caries.",
  },
  // 4
  {
    pregunta: "En relación con las técnicas anestésicas y de sedación en el paciente con epilepsia, ¿cuál de las siguientes afirmaciones es correcta?",
    opciones: [
      "La anestesia general está totalmente contraindicada en pacientes clasificables como ASA III.",
      "El midazolam es la benzodiazepina de primera elección para la sedación consciente.",
      "Se recomienda el uso de analgesia dental electrónica en todas las sesiones.",
      "Se debe minimizar la dosis de lidocaína por sus efectos en el sistema nervioso central y evitar el uso de midazolam, flumazenil y óxido nitroso.",
    ],
    correcta: 3,
    feedback: "Se debe minimizar la lidocaína por efectos en el SNC y evitar midazolam, flumazenil y óxido nitroso.",
  },
  // 5
  {
    pregunta: "En el protocolo operativo del gabinete dental, ¿cuál es la función de un \"perro de alerta\" en la atención de pacientes con epilepsia?",
    opciones: [
      "Administrar de forma autónoma la medicación anticonvulsiva de emergencia.",
      "Guiar al paciente hacia la sala de espera al finalizar la consulta.",
      "Avisar sobre la llegada inminente de una crisis o ataque epiléptico antes de que suceda.",
      "Inmovilizar físicamente al paciente sujetando sus extremidades durante el ataque.",
    ],
    correcta: 2,
    feedback: "Los perros de alerta detectan y avisan la llegada inminente de la crisis antes de que ocurra.",
  },
  // 6
  {
    pregunta: "En pacientes con epilepsia severa (\"gran mal\"), ¿cuál es el diseño restaurador recomendado para la confección de prótesis fijas en el sector anterior?",
    opciones: [
      "Prótesis removible de resina flexible sin retenedores metálicos.",
      "Prótesis fijas anteriores con caras palatinas metálicas (evitando la porcelana pura) y el uso de pilares adicionales.",
      "Coronas de porcelana pura sin estructura metálica.",
      "Carillas estéticas de composite fluido directamente adheridas.",
    ],
    correcta: 1,
    feedback: "En \"gran mal\" se recomiendan prótesis fijas anteriores con caras palatinas metálicas para prevenir fracturas de porcelana.",
  },
  // 7
  {
    pregunta: "Durante los tratamientos de odontología conservadora y restauradora en el gabinete, ¿qué elemento de aislamiento y protección es de uso obligatorio?",
    opciones: [
      "Enjuague con alcohol al 70% previo a la preparación.",
      "Dique de goma.",
      "Protector bucal deportivo de silicona.",
      "Casco rígido de protección en todos los casos.",
    ],
    correcta: 1,
    feedback: "El uso del dique de goma es obligatorio durante la odontología conservadora para proteger la vía aérea.",
  },
  // 8
  {
    pregunta: "¿Por qué motivo está contraindicada la prótesis removible en pacientes con epilepsia severa (\"gran mal\") y qué característica debe tener si se indica en cuadros leves?",
    opciones: [
      "Por riesgo de tinción; en casos leves debe ser de resina transparente.",
      "Por alterar la fonación; en casos leves debe ser fija sobre implantes.",
      "Por riesgo de fractura del aparato y obstrucción de la vía aérea durante la convulsión; en casos leves debe llevar material radiopaco y refuerzo de metal o fibra de carbono.",
      "Por causar atrición severa; en casos leves debe ser de silicona blanda.",
    ],
    correcta: 2,
    feedback: "La prótesis removible está contraindicada en \"gran mal\" por riesgo de fractura y aspiración; en casos leves requiere estructura radiopaca y refuerzo de metal/fibra de carbono.",
  },
  // 9
  {
    pregunta: "¿Cuáles de los siguientes fármacos se clasifican como \"epileptógenos\" al reducir el umbral convulsivo e incrementar el riesgo de crisis en el gabinete?",
    opciones: [
      "Tramadol, ketamina, propofol, quinolonas, flumazenil y lidocaína (en dosis elevadas).",
      "Clorhexidina, nanohidroxiapatita y xilitol.",
      "Hidroxicina, paracetamol y amoxicilina.",
      "Valproato sódico, carbamazepina y fenitoína.",
    ],
    correcta: 0,
    feedback: "Fármacos como tramadol, ketamina, propofol, quinolonas, flumazenil y lidocaína reducen el umbral convulsivo.",
  },
  // 10
  {
    pregunta: "¿Por qué está desaconsejada la prescripción de AINEs o ácido acetilsalicílico (AAS) en pacientes en tratamiento con valproato sódico o carbamazepina?",
    opciones: [
      "Porque reducen la eficacia bactericida de la amoxicilina.",
      "Porque incrementan el riesgo de sangrado digestivo y potencian la alteración de la agregación plaquetaria.",
      "Porque inactivan el efecto de los anestésicos locales con vasoconstrictor.",
      "Porque causan hipertermia maligna inmediata.",
    ],
    correcta: 1,
    feedback: "Los AINEs y la aspirina aumentan el riesgo de hemorragia digestiva y potencian la disfunción plaquetaria causada por valproato o carbamazepina.",
  },
  // 11
  {
    pregunta: "¿Cómo se denomina al fenómeno o síntoma inusual (irritabilidad, cefalea, alucinaciones sensoriales) que aparece segundos antes de una crisis convulsiva?",
    opciones: [
      "Parálisis de Todd.",
      "Fase Postictal.",
      "Status Epilepticus.",
      "Aura.",
    ],
    correcta: 3,
    feedback: "El aura es el fenómeno sensorial/emocional premonitorio que antecede en segundos a la convulsión.",
  },
  // 12
  {
    pregunta: "¿Cuáles son las manifestaciones clínicas características de la Fase Ictal (convulsiva) en un ataque de \"Gran Mal\" y cuál es su duración habitual?",
    opciones: [
      "Fiebre elevada y erupción cutánea papular.",
      "Grito epiléptico, pérdida de conciencia, rigidez tónica, sacudidas clónicas (3 a 7 minutos), cianosis, apnea y mordedura de lengua.",
      "Ausencia breve con mirada fija de menos de 10 segundos sin pérdida de conciencia.",
      "Estupor y confusión mental con parálisis transitoria durante 10 a 15 horas.",
    ],
    correcta: 1,
    feedback: "La fase ictal cursa con grito epiléptico, pérdida de conciencia, rigidez tónica, sacudidas clónicas (3-7 min), cianosis y mordedura de lengua.",
  },
  // 13
  {
    pregunta: "¿Qué caracteriza al \"Status Epilepticus\" y cuál es su gravedad clínica?",
    opciones: [
      "Una pausa respiratoria transitoria de menos de 15 segundos sin secuelas.",
      "Un estado de somnolencia fisiológica posterior a la consulta.",
      "El desarrollo de ataques repetitivos sin recuperación de la conciencia entre episodios, siendo una emergencia vital grave con mortalidad del 5 al 20%.",
      "La recuperación inmediata de la orientación tras un solo episodio clónico.",
    ],
    correcta: 2,
    feedback: "El Status Epilepticus es la repetición de ataques sin recuperar la conciencia, con alta mortalidad (5-20%).",
  },
  // 14
  {
    pregunta: "Ante el desencadenamiento de una crisis convulsiva en el sillón dental, ¿cuál debe ser la primera acción inmediata del profesional?",
    opciones: [
      "Administrar líquidos por vía oral para revertir el cuadro.",
      "Inmovilizar las extremidades del paciente aplicando fuerza física máxima.",
      "Interrumpir de inmediato el tratamiento dental y retirar todos los instrumentos, materiales y el dique de goma de la boca.",
      "Continuar rápidamente con el procedimiento para colocar el material de obturación.",
    ],
    correcta: 2,
    feedback: "La prioridad inmediata es detener el procedimiento y liberar la cavidad oral de instrumentos y dique de goma.",
  },
  // 15
  {
    pregunta: "¿Cómo se debe posicionar al paciente durante la crisis y en qué momento es obligatorio activar el sistema de emergencias médicas?",
    opciones: [
      "Sentado a 90º; no activar emergencias bajo ninguna circunstancia.",
      "En posición de Trendelenburg estricta; activar emergencias a los 10 segundos.",
      "En posición lateral de seguridad, protegiendo la cabeza sin contener los movimientos bruscamente, manteniendo vía aérea y O2; activar emergencias si la crisis supera los 5 minutos o evoluciona a Status Epilepticus.",
      "En posición prono (boca abajo); activar emergencias tras 30 minutos de estupor postictal.",
    ],
    correcta: 2,
    feedback: "Se coloca en posición lateral de seguridad protegiendo la cabeza sin contención brusca; se activa emergencias si dura >5 min o entra en Status Epilepticus.",
  },
]
