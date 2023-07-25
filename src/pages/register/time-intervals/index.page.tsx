import { Container, Header } from "../connect-calendar/styles";
import {
  Heading,
  Text,
  MultiStep,
  Checkbox,
  TextInput,
  Button,
} from "@ignite-ui/react";
import {
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from "./styles";
import { ArrowRight, Check } from "phosphor-react";
import { Schema, z } from "zod";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { getWeekDays } from "../../../utils/get-week-days";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError } from "../styles";
import { convertTimeStringToMinutes } from "../../../utils/convert-time-string-to-minutes";
import { api } from "../../../lib/axios";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: "Selecione pelo menos um dia da semana",
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        };
      });
    })
    .refine((intervals) => {
      return intervals.every(
        (interval) =>
          interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes
      );
    }, {message: 'O horário de término deve ser pelo menos 1h depois do horário de início'}),
});

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>;

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    watch,
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: "08:00", endTime: "18:00" },
        { weekDay: 1, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekDay: 2, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekDay: 3, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekDay: 4, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekDay: 5, enabled: true, startTime: "08:00", endTime: "18:00" },
        { weekDay: 6, enabled: false, startTime: "08:00", endTime: "18:00" },
      ],
    },
  });

  const intervals = watch("intervals");

  const weekDays = getWeekDays();

  const router = useRouter()

  const { fields } = useFieldArray({
    control,
    name: "intervals",
  });

  async function handleSetTimeIntervals(data: any) {
    const {intervals} = data as TimeIntervalsFormOutput
    
    await api.post('/users/time-intervals', {intervals})

    await router.push('/register/update-profile')
  }

  return (
    <>
    <NextSeo title="Selecione sua disponibilidade | Ignite Call" noindex />
    <Container>
      <Header>
        <Heading as="strong">Quase lá</Heading>
        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>
        <MultiStep size={4} currentStep={3} />
      </Header>

      <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
        <IntervalsContainer>
          {fields.map((field, index) => {
            return (
              <IntervalItem key={field.id}>
                <IntervalDay>
                  <Controller
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Checkbox
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                        }}
                        checked={field.value}
                        />
                        );
                      }}
                  />
                  <Text>{weekDays[field.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    {...register(`intervals.${index}.startTime`)}
                    disabled={intervals[index].enabled === false}
                    />
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    {...register(`intervals.${index}.endTime`)}
                    disabled={intervals[index].enabled === false}
                  />
                </IntervalInputs>
              </IntervalItem>
            );
          })}
        </IntervalsContainer>

        {errors.intervals && (
          <FormError size="sm">{errors.intervals.message}</FormError>
          )}

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
    </>
  );
}
