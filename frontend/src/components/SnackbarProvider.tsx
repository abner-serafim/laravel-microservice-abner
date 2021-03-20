// @flow
import * as React from 'react';
import {
    SnackbarProvider as NotiSnackbarProvider,
    SnackbarProviderProps
} from 'notistack';
import {IconButton} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close'
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => {
    return {
        variantSuccess: {
            backgroundColor: `${theme.palette.success.main} !important`,
        },
        variantError: {
            backgroundColor: `${theme.palette.error.main} !important`
        },
        variantInfo: {
            backgroundColor: `${theme.palette.primary.main} !important`
        },
    };
});

export const SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {

    let snackbarProviderRef: NotiSnackbarProvider | null;
    const classes = useStyles();
    const defaultProps: SnackbarProviderProps = {
        ...props,
        classes,
        autoHideDuration: 3000,
        maxSnack: 3,
        anchorOrigin: {
            horizontal: 'right',
            vertical: 'top'
        },
        ref: (el) => snackbarProviderRef = el,
        action: (key) => (
            <IconButton
                color={"inherit"}
                style={{fontSize: 20}}
                onClick={() => snackbarProviderRef?.closeSnackbar(key)}
            >
                <CloseIcon />
            </IconButton>
        )
    }

    return (
        <NotiSnackbarProvider {...defaultProps}>
            {defaultProps.children}
        </NotiSnackbarProvider>
    );
};
