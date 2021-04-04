// @flow
import * as React from 'react';
import {Grid, GridProps} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
    gridItem: {
        padding: theme.spacing(1, 0)
    }
}));

interface DefaultFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    GridProps?: GridProps;
    GridItemProps?: GridProps;
}
export const DefaultForm: React.FC<DefaultFormProps> = (props) => {
    const { GridProps, GridItemProps } = props;
    const classes = useStyles();

    return (
        <form {...props}>
            <Grid className={classes.gridItem} container {...GridProps}>
                <Grid item xs={12} md={6} {...GridItemProps}>
                    {props.children}
                </Grid>
            </Grid>
        </form>
    );
};
