import { useEffect, useState } from "react";
import "./UserFormPage.css";
import { Link } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import type { UserFormData } from "../../types/user";

function UserFormPage() {
  const { user, isLogged } = useAuth();
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [previewImage, setPreviewImage] = useState<string>();

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3310/api/user/${user.id}`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération");
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Impossible de récupérer les données utilisateur");
      });
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error("La taille de l'image ne doit pas être supérieur à 500ko");
        e.target.value = "";
        setPreviewImage(undefined);
        return;
      }
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const data = new FormData(e.currentTarget);

    fetch(`http://localhost:3310/api/user/${user.id}`, {
      method: "PUT",
      credentials: "include",
      body: data,
    })
      .then((response) => {
        if (response.ok) {
          toast.success("Informations mises à jour avec succès !");
        } else {
          throw new Error("Erreur lors de la mise à jour");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Impossible de mettre à jour les données");
      });
  };

  if (!isLogged) {
    return (
      <main className="link-login">
        <section>
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <Link to="/login">
            <button type="button">Accéder à la page de connexion</button>
          </Link>
        </section>
      </main>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <>
      <main className="user-form-main">
        <section>
          <img src="/img/contact.png" alt="contact" />
          <figcaption>
            {userData.firstname} {userData.lastname}
          </figcaption>

          <form onSubmit={handleSubmit}>
            <h2>Mes informations personnelles</h2>

            <label htmlFor="lastname">Nom</label>
            <input
              type="text"
              placeholder="ex: Dupont"
              name="lastname"
              defaultValue={userData.lastname}
            />

            <label htmlFor="firstname">Prénom</label>
            <input
              name="firstname"
              type="text"
              placeholder="ex: Jean"
              defaultValue={userData.firstname}
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="ex: jean.dupont@example.com"
              name="email"
              defaultValue={userData.email}
            />

            <input
              type="file"
              name="image"
              accept="image/png, image/jpg, image/jpeg"
              id="user-image"
              onChange={handleFileChange}
            />
            <label htmlFor="user-image" className="file-label">
              Choisir une image
            </label>
            {previewImage ? (
              <img src={previewImage} alt="Prévisualisation" />
            ) : (
              userData.image && (
                <img src={`http://localhost:3310/${userData.image}`} alt="Illustration" />
              )
            )}

            <label htmlFor="description">Description</label>
            <textarea
              rows={5}
              placeholder="ex: Passionné d'art contemporain..."
              name="description"
              defaultValue={userData.description}
            />

            <h2>Mon Adresse</h2>

            <label htmlFor="street">Adresse</label>
            <input
              type="text"
              placeholder="ex: 123 rue de Paris"
              name="street"
              defaultValue={userData.street}
            />

            <label htmlFor="city">Ville</label>
            <input
              type="text"
              placeholder="ex: Paris"
              name="city"
              defaultValue={userData.city}
            />

            <label htmlFor="zip_code">Code Postal</label>
            <input
              type="text"
              placeholder="ex: 75000"
              name="zip_code"
              defaultValue={userData.zip_code}
            />

            <label htmlFor="country">Pays</label>
            <input
              type="text"
              placeholder="ex: France"
              name="country"
              defaultValue={userData.country}
            />

            <button type="submit">Valider</button>
          </form>
        </section>
      </main>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default UserFormPage;
