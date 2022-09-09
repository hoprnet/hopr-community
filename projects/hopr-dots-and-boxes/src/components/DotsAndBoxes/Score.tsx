import { Typography } from '@mui/material';
import './styles/Score.style.css';

function Score({
	color = '#ffffff',
	title = '<title>',
	value = 0,
	active = false,
}: {
	color: string,
	title: string,
	value: number,
	active: boolean,
}) {
	return (
		<div className="score-container">
			<Typography className="title" style={{ color: color, fontWeight: active ? '700' : '500' }}>
				{title}: {value}
			</Typography>
			{/* <Typography className="value">{value}</Typography> */}
		</div>
	);
}

export default Score;
