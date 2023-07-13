import { TextInput, Button, Text} from "@ignite-ui/react";
import { Form, FormAnnotation } from "./styles";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from "next/router";

const claimUsernameFormSchema = z.object({
    username: z.string()
        .regex(/^([a-z\\\\-]+)$/i, {message: 'Apenas letras e hifens'})
        .min(3, {message: 'Mínimo 3 caracteres'})
        .transform(username => username.toLowerCase()),
})

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>

export function ClaimUsernameForm() {
    const { register, handleSubmit, formState: {errors, isSubmitting} } = useForm<ClaimUsernameFormData>({
        resolver: zodResolver(claimUsernameFormSchema)
    })

    const router = useRouter()

    async function handleClaimUsername(data: ClaimUsernameFormData) {
        const { username } = data

        await router.push(`/register?username=${username}`)
    } 

  return (
    <>
    <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
      <TextInput prefix="ignite.com/" size="sm" placeholder="seu-usuario" {...register('username')}/>
      <Button size="sm" type="submit" disabled={isSubmitting}>
        Reservar
        <ArrowRight />
      </Button>
    </Form>
      <FormAnnotation>
        <Text size='sm'>
            {errors.username ? errors.username.message : 'Digite o nome do usuário desejado'}
        </Text>
      </FormAnnotation>
    </>
  );
}
