import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type SeedOption = { id: string; text_es: string; text_ru: string }
type SeedQuestion = {
  id: string
  category: string
  question_es: string
  question_ru: string
  options: SeedOption[]
  correct_option_ids: string[]
  media?: { type: 'image'; url: string } | null
  explanation_ru?: string
  source: { title: string; url: string; retrieved_at: string }
}

const questions: SeedQuestion[] = [
  {
    id: 'ar-caba-b-001',
    category: 'seniales',
    question_es: '¿Qué significa una señal triangular con el borde rojo y un peatón en el centro?',
    question_ru: 'Что означает треугольный знак с красной каймой и пешеходом в центре?',
    options: [
      { id: 'a', text_es: 'Zona peatonal prohibida.', text_ru: 'Пешеходная зона запрещена.' },
      { id: 'b', text_es: 'Proximidad de un cruce peatonal.', text_ru: 'Приближение к пешеходному переходу.' },
      { id: 'c', text_es: 'Fin de la zona escolar.', text_ru: 'Конец школьной зоны.' },
      { id: 'd', text_es: 'Parada de colectivo.', text_ru: 'Остановка автобуса.' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'Треугольник с красной каймой — предупреждающий знак. Пешеход внутри означает близкий пешеходный переход.',
    source: { title: 'CABA — Manual del conductor', url: 'https://buenosaires.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-002',
    category: 'prioridad',
    question_es: 'En una intersección sin semáforos ni señales, ¿quién tiene prioridad de paso?',
    question_ru: 'На перекрёстке без светофоров и знаков — у кого приоритет?',
    options: [
      { id: 'a', text_es: 'El vehículo que viene por la izquierda.', text_ru: 'Машина, которая едет слева.' },
      { id: 'b', text_es: 'El vehículo que viene por la derecha.', text_ru: 'Машина, которая едет справа.' },
      { id: 'c', text_es: 'El vehículo más grande.', text_ru: 'Машина крупнее.' },
      { id: 'd', text_es: 'El que toque bocina primero.', text_ru: 'Тот, кто первым посигналит.' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'По правилам Аргентины (Ley 24.449) приоритет у того, кто приближается справа, если нет знаков.',
    source: { title: 'Ley Nacional de Tránsito 24.449', url: 'https://www.argentina.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-003',
    category: 'velocidad',
    question_es: '¿Cuál es la velocidad máxima permitida en calles de CABA, salvo señalización en contrario?',
    question_ru: 'Какая максимальная разрешённая скорость на улицах Буэнос-Айреса, если нет других знаков?',
    options: [
      { id: 'a', text_es: '20 km/h', text_ru: '20 км/ч' },
      { id: 'b', text_es: '40 km/h', text_ru: '40 км/ч' },
      { id: 'c', text_es: '60 km/h', text_ru: '60 км/ч' },
      { id: 'd', text_es: '80 km/h', text_ru: '80 км/ч' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'По умолчанию в CABA на обычных улицах — 40 км/ч. На авенидах — 60 км/ч.',
    source: { title: 'CABA — Manual del conductor', url: 'https://buenosaires.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-004',
    category: 'alcohol',
    question_es: '¿Cuál es el límite legal de alcohol en sangre para conductores particulares en CABA?',
    question_ru: 'Какой законный лимит алкоголя в крови для обычных водителей в Буэнос-Айресе?',
    options: [
      { id: 'a', text_es: '0,0 g/l (tolerancia cero).', text_ru: '0,0 г/л (нулевая терпимость).' },
      { id: 'b', text_es: '0,5 g/l.', text_ru: '0,5 г/л.' },
      { id: 'c', text_es: '0,8 g/l.', text_ru: '0,8 г/л.' },
      { id: 'd', text_es: '1,0 g/l.', text_ru: '1,0 г/л.' },
    ],
    correct_option_ids: ['a'],
    explanation_ru: 'С 2023 года в CABA действует закон «Alcohol Cero al Volante»: 0 г/л для всех водителей.',
    source: { title: 'Ley CABA 6.394 — Alcohol Cero', url: 'https://buenosaires.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-005',
    category: 'seniales',
    question_es: 'Una señal circular con fondo azul y una flecha blanca hacia arriba indica:',
    question_ru: 'Круглый знак с синим фоном и белой стрелкой вверх означает:',
    options: [
      { id: 'a', text_es: 'Prohibido avanzar.', text_ru: 'Движение вперёд запрещено.' },
      { id: 'b', text_es: 'Sentido obligatorio: recto.', text_ru: 'Обязательное направление: прямо.' },
      { id: 'c', text_es: 'Fin de una calle sin salida.', text_ru: 'Конец тупика.' },
      { id: 'd', text_es: 'Carril exclusivo para bicicletas.', text_ru: 'Полоса только для велосипедов.' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'Круглые синие знаки — предписывающие. Белая стрелка вверх = обязательно двигаться прямо.',
    source: { title: 'CABA — Manual del conductor', url: 'https://buenosaires.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-006',
    category: 'documentos',
    question_es: '¿Qué documentos debe llevar siempre un conductor en CABA?',
    question_ru: 'Какие документы водитель всегда должен иметь при себе в CABA?',
    options: [
      { id: 'a', text_es: 'Solo la licencia de conducir.', text_ru: 'Только водительские права.' },
      { id: 'b', text_es: 'Licencia, cédula verde/azul, seguro y VTV vigente.', text_ru: 'Права, cédula verde/azul, страховка и действующий VTV.' },
      { id: 'c', text_es: 'Solo el DNI.', text_ru: 'Только DNI.' },
      { id: 'd', text_es: 'Licencia y pasaporte.', text_ru: 'Права и паспорт.' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'Обязательный набор: licencia, cédula (зелёная если владелец, синяя если нет), seguro obligatorio, VTV.',
    source: { title: 'CABA — Requisitos para conducir', url: 'https://buenosaires.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-007',
    category: 'prioridad',
    question_es: '¿Quién tiene siempre prioridad absoluta en la vía pública?',
    question_ru: 'У кого всегда абсолютный приоритет на дороге?',
    options: [
      { id: 'a', text_es: 'Los taxis.', text_ru: 'У такси.' },
      { id: 'b', text_es: 'Los vehículos de emergencia con sirena activada.', text_ru: 'У экстренных служб с включённой сиреной.' },
      { id: 'c', text_es: 'Las motos.', text_ru: 'У мотоциклов.' },
      { id: 'd', text_es: 'Los colectivos.', text_ru: 'У автобусов.' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'Скорая, пожарные, полиция и подобные — при включённой сирене/маяке имеют абсолютный приоритет.',
    source: { title: 'Ley Nacional de Tránsito 24.449 art. 61', url: 'https://www.argentina.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-008',
    category: 'estacionamiento',
    question_es: '¿A qué distancia mínima de una esquina está prohibido estacionar en CABA?',
    question_ru: 'На каком минимальном расстоянии от угла запрещено парковаться в CABA?',
    options: [
      { id: 'a', text_es: '3 metros.', text_ru: '3 метра.' },
      { id: 'b', text_es: '5 metros.', text_ru: '5 метров.' },
      { id: 'c', text_es: '10 metros.', text_ru: '10 метров.' },
      { id: 'd', text_es: '15 metros.', text_ru: '15 метров.' },
    ],
    correct_option_ids: ['c'],
    explanation_ru: 'Парковка запрещена в 10 м от угла перекрёстка, чтобы не блокировать обзор.',
    source: { title: 'Código de Tránsito CABA', url: 'https://buenosaires.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-009',
    category: 'seguridad',
    question_es: '¿Es obligatorio el uso del cinturón de seguridad en los asientos traseros?',
    question_ru: 'Обязателен ли ремень безопасности на задних сиденьях?',
    options: [
      { id: 'a', text_es: 'No, solo adelante.', text_ru: 'Нет, только спереди.' },
      { id: 'b', text_es: 'Sí, para todos los ocupantes del vehículo.', text_ru: 'Да, для всех пассажиров автомобиля.' },
      { id: 'c', text_es: 'Solo en autopistas.', text_ru: 'Только на автострадах.' },
      { id: 'd', text_es: 'Solo para menores de edad.', text_ru: 'Только для несовершеннолетних.' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'Ремень обязателен на всех сиденьях, включая задние. Дети до 10 лет — только сзади и в креслах.',
    source: { title: 'Ley Nacional 24.449 art. 40', url: 'https://www.argentina.gob.ar/', retrieved_at: '2026-04-24' },
  },
  {
    id: 'ar-caba-b-010',
    category: 'luces',
    question_es: '¿Cuándo es obligatorio circular con las luces bajas encendidas?',
    question_ru: 'Когда обязательно включать ближний свет фар?',
    options: [
      { id: 'a', text_es: 'Solo de noche.', text_ru: 'Только ночью.' },
      { id: 'b', text_es: 'De noche, en túneles y con mala visibilidad.', text_ru: 'Ночью, в туннелях и при плохой видимости.' },
      { id: 'c', text_es: 'Solo cuando llueve.', text_ru: 'Только при дожде.' },
      { id: 'd', text_es: 'Nunca, salvo en ruta.', text_ru: 'Никогда, кроме как на трассе.' },
    ],
    correct_option_ids: ['b'],
    explanation_ru: 'Ближний свет обязателен ночью, в туннелях, а также при тумане или дожде — любая плохая видимость.',
    source: { title: 'Ley Nacional 24.449 art. 47', url: 'https://www.argentina.gob.ar/', retrieved_at: '2026-04-24' },
  },
]

async function main() {
  console.log(`Seeding ${questions.length} questions...`)

  for (const q of questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        jurisdiction: 'CABA',
        licenseClass: 'B',
        category: q.category,
        questionEs: q.question_es,
        questionRu: q.question_ru,
        type: 'single_choice',
        correctOptionIds: q.correct_option_ids,
        media: q.media ?? undefined,
        explanationRu: q.explanation_ru,
        source: q.source,
        status: 'active',
      },
      update: {
        questionEs: q.question_es,
        questionRu: q.question_ru,
        correctOptionIds: q.correct_option_ids,
        media: q.media ?? undefined,
        explanationRu: q.explanation_ru,
        source: q.source,
      },
    })

    // Replace options for idempotency.
    await prisma.questionOption.deleteMany({ where: { questionId: q.id } })
    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i]
      await prisma.questionOption.create({
        data: {
          questionId: q.id,
          optionId: opt.id,
          textEs: opt.text_es,
          textRu: opt.text_ru,
          sortOrder: i,
        },
      })
    }
  }

  console.log('Seed done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
