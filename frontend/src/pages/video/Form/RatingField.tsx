// @flow
import * as React from 'react';
import {
    Box,
    FormControl,
    FormControlLabel,
    FormControlLabelProps,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup
} from "@material-ui/core";
import Rating from "../../../components/Rating";

const ratings: FormControlLabelProps[] = [
    {value: 'L', control: <Radio color={'primary'} />, label: <Rating rating={'L'} />, labelPlacement: 'top' },
    {value: '10', control: <Radio color={'primary'} />, label: <Rating rating={'10'} />, labelPlacement: 'top' },
    {value: '12', control: <Radio color={'primary'} />, label: <Rating rating={'12'} />, labelPlacement: 'top' },
    {value: '14', control: <Radio color={'primary'} />, label: <Rating rating={'14'} />, labelPlacement: 'top' },
    {value: '16', control: <Radio color={'primary'} />, label: <Rating rating={'16'} />, labelPlacement: 'top' },
    {value: '18', control: <Radio color={'primary'} />, label: <Rating rating={'18'} />, labelPlacement: 'top' },
];

interface RatingFieldProps {
    name: string;
    label: string;
    value: string;
    setValue: (value) => void;
    disabled?: boolean;
    error: any;
}
export const RatingField: React.FC<RatingFieldProps> = (props) => {
    const { name, label, error, value, setValue, disabled } = props;

    return (
        <FormControl
            margin={"none"}
            error={error !== undefined}
            disabled={disabled === true}
        >
            <FormLabel component="legend">{label}</FormLabel>
            <Box paddingTop={1}>
                <RadioGroup
                    name={name}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    value={value + ""}
                    row
                >
                    {
                        ratings.map(
                            (ratingProps, key) => <FormControlLabel key={key} {...ratingProps} />
                        )
                    }
                </RadioGroup>
            </Box>
            {
                error && <FormHelperText>{error.message}</FormHelperText>
            }
        </FormControl>
    );
};
