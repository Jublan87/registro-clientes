-- Si ya existe, no falla
IF DB_ID(N'gestor_clientes_sqlserver') IS NULL CREATE DATABASE gestor_clientes_sqlserver;

GO
    USE gestor_clientes_sqlserver;

GO
    IF OBJECT_ID(N'dbo.clientes', 'U') IS NULL BEGIN CREATE TABLE dbo.clientes (
        id CHAR(6) PRIMARY KEY,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        age INT NOT NULL
    );

END
GO