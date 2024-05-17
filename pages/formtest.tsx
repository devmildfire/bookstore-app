export default function FormTest({ name = 'person' }) {
  return (
    <form action='http://localhost:3000/successpayment' method='post'>
      <input name='InvID' defaultValue={143} />
      <input name='OutSum' defaultValue={10} />
      <input name='SignatureValue' defaultValue={'sdfsfsfsfsf'} />

      <button type='submit'>submit</button>
    </form>
  );
}
