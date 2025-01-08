const Signature = (props) => {
  return (
    <>
      <div className="mb-4 color-neutral-11">Signed By:</div>
      <div className="border-l-4 border-secondary-9 pl-2">
        <div className="text-12 color-neutral-12">{props.name}</div>
        <div className="color-neutral-a11">{props.address}</div>
      </div>
    </>
  );
};

export default Signature;
