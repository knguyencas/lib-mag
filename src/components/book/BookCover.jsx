import './BookCover.css';

function BookCover({ image, title, author }) {
  return (
    <div className="book-cover-column">
      <div
        className="book-cover"
        style={
          image
            ? {
                backgroundImage: `url('${image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                aspectRatio: '3 / 4'
              }
            : {
                background: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '3 / 4'
              }
        }
      >
        {!image && <span style={{ color: '#666' }}>No cover available</span>}
      </div>
    </div>
  );
}

export default BookCover;