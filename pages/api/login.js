export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' })
  // res.status(200).send('Hello next')
}
