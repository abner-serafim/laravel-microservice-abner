// @flow
import * as React from 'react';
import {Box, Container, makeStyles, Typography} from "@material-ui/core";
import {PropsWithChildren} from "react";

const useStyles = makeStyles({
    title: {
        color: '#999999'
    }
});

type Props = {
    title: string
};
export const Page:React.FC<Props> = (props: PropsWithChildren<Props>) => {
    const classes = useStyles();

    return (
        <Container>
            <Typography className={classes.title} component="h1" variant="h5">
                {props.title}
            </Typography>
            <Box paddingTop={1}>
                {props.children}
            </Box>
        </Container>
    );
};
