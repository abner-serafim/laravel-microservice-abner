// @flow
import * as React from 'react';
import {
    Box,
    Button,
    ButtonProps,
    FormControl,
    FormControlLabel, FormHelperText, FormLabel, Radio,
    RadioGroup,
    TextField
} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import castMemberHttp from "../../services/http/cast-member-http";
import yup from "../../utils/vendor/yup";
import {useHistory, useParams} from "react-router";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}));

type Inputs = {
    name: string;
    type: number;
}

const schema = yup.object().shape({
    name: yup.string().label("Nome").required().min(3).max(255),
    type: yup.number().label("Tipo").required(),
});

export const Form = () => {
    const {id} = useParams<{id: string}>();

    const {
        register,
        watch,
        errors,
        handleSubmit,
        getValues,
        setValue,
        reset
    } = useForm<Inputs>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            type: undefined,
        }
    });

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const [castMember, setCastMember] = useState<{id: string} | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit,
        disabled: loading
    };

    useEffect(() => {
        if (!id) return;

        async function getCastMember() {
            setLoading(true);
            try {
                const {data: {data}} = await castMemberHttp.get(id);
                setCastMember(data);
                reset(data);
            } catch (e) {

            } finally {
                setLoading(false);
            }
        }

        getCastMember();
    }, [id, reset]);

    useEffect(() => {
        register({name: "type"});
    }, [register]);

    async function onSubmit(formData, event) {
        castMemberHttp
            .create(formData)
            .then((responde) => console.log(responde));

        setLoading(true);
        try {
            const http = !castMember
                ? castMemberHttp.create(formData)
                : castMemberHttp.update(castMember.id, formData)
            ;

            const {data: {data}} = await http;
            snackbar.enqueueSnackbar(
                'Membro de elencos salva com sucesso',
                {variant: "success"}
            );
            setTimeout(() => {
                if (event) {
                    history.replace(`/cast_members/${data.id}/edit`)
                } else {
                    history.push('/cast_members');
                }
            });
        } catch (e) {
            console.log(e)
            snackbar.enqueueSnackbar(
                'Não foi possível salvar membro de elencos',
                {variant: "error"}
            );
        } finally {
            setLoading(false);
        }
    }

    console.log("errors", errors)

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                inputRef={register}
                name="name"
                label="Nome"
                fullWidth
                disabled={loading}
                variant={"outlined"}
                InputLabelProps={{shrink: true}}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
            />
            <FormControl
                margin={"normal"}
                error={errors.type !== undefined}
                disabled={loading}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue("type", parseInt(e.target.value));
                    }}
                    value={watch("type") + ""}
                >
                    <FormControlLabel value="1" control={<Radio />} label={"Diretor"} />
                    <FormControlLabel value="2" control={<Radio />} label={"Ator"} />
                </RadioGroup>
                {
                    errors.type && <FormHelperText id="type-helper-text">{errors.type.message}</FormHelperText>
                }
            </FormControl>
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
