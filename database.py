from pymongo import MongoClient
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# ==========================================
# 1. CONFIGURACIÓN MONGODB (Actualizada RADIANT)
# ==========================================
# Usamos la URL INTERNA de Railway para mejor rendimiento
MONGO_URI_INTERNAL = "mongodb://mongo:tMyPfsqrNWedkyjydPhfUaRudSKsWNeJ@mongodb-mdzj.railway.internal:27017"

# Priorizamos variable de entorno, si no existe, usamos la interna hardcodeada
MONGO_URL = os.getenv("MONGO_URL", MONGO_URI_INTERNAL)
MONGO_DB = os.getenv("MONGO_DB", "test")

try:
    client = MongoClient(MONGO_URL)
    db = client[MONGO_DB]
    print("Conexión a MongoDB (Radiant) exitosa")
except Exception as e:
    print("Error al conectar a MongoDB:", e)
    db = None

# Colecciones MongoDB
if db is not None:
    barberos_col = db["barberos"]
    servicios_col = db["servicios"]
    productos_col = db["productos"]
    reservas_col = db["reservas"]
    disponibilidades_col = db["disponibilidades"]
    notificaciones_col = db["notificaciones"]
    jefes_col = db["jefes"]
    clientes_col = None 
else:
    barberos_col = servicios_col = productos_col = reservas_col = jefes_col = clientes_col = None

# ==========================================
# 2. CONFIGURACIÓN MYSQL (Actualizada RADIANT)
# ==========================================
# Credenciales internas de Railway
DB_USER = os.environ.get("MYSQLUSER", "root")
DB_PASS = os.environ.get("MYSQLPASSWORD", "OgLEZxyOVkvGRnPaOxVPazCUkxsNVFbu")
DB_HOST = os.environ.get("MYSQLHOST", "mysql-i447.railway.internal")
DB_NAME = os.environ.get("MYSQLDATABASE", "railway")
DB_PORT = os.environ.get("MYSQLPORT", "3306")

# Construcción de la URL para SQLAlchemy
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    # pool_pre_ping ayuda a mantener la conexión viva
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    print(f"✅ Motor SQL (Clientes Radiant) configurado hacia: {DB_HOST}")
except Exception as e:
    print("❌ Error al configurar motor SQL:", e)
    Base = declarative_base()

# --- Modelo SOLO para Clientes ---
class ClienteSQL(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    apellido = Column(String(100), nullable=True)
    correo = Column(String(100), unique=True, index=True)
    telefono = Column(String(20))
    rut = Column(String(20), nullable=True)
    direccion = Column(String(200), nullable=True)
    estado = Column(String(50), default="nuevo")

# Crear tablas si no existen
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Advertencia SQL:", e)

def get_db_sql():
    db_sql = SessionLocal()
    try:
        yield db_sql
    finally:
        db_sql.close()