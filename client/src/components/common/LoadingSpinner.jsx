const LoadingSpinner = ({size}) => {
	
	const sizeClass = `loading-${size}`;
	// console.log(sizeClass)

	return <span className={`loading loading-spinner ${sizeClass}`} />;
};
export default LoadingSpinner;