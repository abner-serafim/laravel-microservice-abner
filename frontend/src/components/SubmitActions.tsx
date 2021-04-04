// @flow
import * as React from 'react';
import {Box, Button, ButtonProps} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}));

interface SubmitActionsProps {
    atualizar?: boolean;
    loading?: boolean;
    onClick?: () => void;
}
export const SubmitActions: React.FC<SubmitActionsProps> = (props) => {
    const classes = useStyles();

    let name = "Salvar";
    if (props.atualizar) {
        name = "Atualizar";
    }

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit,
        disabled: props.loading || false
    };

    return (
        <Box dir={"rtl"}>
            <Button {...buttonProps} onClick={props.onClick}>{name}</Button>
            <Button {...buttonProps} type="submit">{name} e continuar editando</Button>
        </Box>
    );
};
