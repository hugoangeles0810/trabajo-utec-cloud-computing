# 🔧 Troubleshooting - Gamarriando

Guía de solución de problemas comunes en el proyecto Gamarriando.

## 🐛 Problemas Comunes

### **Frontend Issues**

#### **Error: Cannot resolve module**
```bash
# Problema: Módulos no encontrados
# Solución:
rm -rf node_modules package-lock.json
npm install
```

#### **Error: Build failed**
```bash
# Problema: Error en build de Next.js
# Solución:
npm run build
# Verificar errores en consola
# Revisar imports y tipos TypeScript
```

#### **Error: S3 deployment failed**
```bash
# Problema: No se puede desplegar a S3
# Solución:
aws configure list
aws s3 ls --profile personal
# Verificar credenciales AWS
```

### **Backend Issues**

#### **Error: Lambda function timeout**
```bash
# Problema: Timeout en Lambda
# Solución:
# 1. Verificar logs en CloudWatch
aws logs tail /aws/lambda/function-name --follow

# 2. Aumentar timeout en serverless.yml
timeout: 30

# 3. Optimizar código
```

#### **Error: Database connection failed**
```bash
# Problema: No se puede conectar a RDS
# Solución:
# 1. Verificar security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# 2. Verificar VPC configuration
aws ec2 describe-vpcs --vpc-ids vpc-xxxxxxxxx

# 3. Verificar connection string
DATABASE_URL=postgresql://user:pass@host:port/db
```

#### **Error: CORS issues**
```bash
# Problema: CORS errors en API
# Solución:
# 1. Verificar headers CORS en Lambda
headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
}

# 2. Configurar OPTIONS method en API Gateway
```

### **API Issues**

#### **Error: 500 Internal Server Error**
```bash
# Problema: Error 500 en endpoints
# Solución:
# 1. Verificar logs de Lambda
aws logs tail /aws/lambda/function-name --follow

# 2. Verificar base de datos
# 3. Verificar variables de entorno
# 4. Verificar permisos IAM
```

#### **Error: 404 Not Found**
```bash
# Problema: Endpoint no encontrado
# Solución:
# 1. Verificar ruta en API Gateway
# 2. Verificar serverless.yml
# 3. Verificar deployment
serverless deploy --stage dev
```

#### **Error: 401 Unauthorized**
```bash
# Problema: Error de autenticación
# Solución:
# 1. Verificar JWT token
# 2. Verificar secret key
# 3. Verificar token expiration
```

## 🔍 Debugging

### **Frontend Debugging**

#### **React DevTools**
```bash
# Instalar React DevTools
# Chrome: React Developer Tools extension
# Firefox: React Developer Tools addon
```

#### **Network Tab**
```bash
# Verificar requests API
# 1. Abrir DevTools
# 2. Ir a Network tab
# 3. Verificar requests y responses
# 4. Verificar status codes
```

#### **Console Errors**
```bash
# Verificar errores en consola
# 1. Abrir DevTools
# 2. Ir a Console tab
# 3. Revisar errores JavaScript
# 4. Verificar warnings
```

### **Backend Debugging**

#### **CloudWatch Logs**
```bash
# Ver logs en tiempo real
aws logs tail /aws/lambda/function-name --follow --profile personal

# Ver logs específicos
aws logs filter-log-events \
  --log-group-name /aws/lambda/function-name \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --profile personal
```

#### **Local Testing**
```bash
# Test local de Lambda
serverless invoke local --function function-name

# Test con datos específicos
serverless invoke local --function function-name --data '{"key": "value"}'
```

#### **Database Debugging**
```bash
# Conectar a base de datos
psql "postgresql://user:pass@host:port/db"

# Verificar conexiones
SELECT * FROM pg_stat_activity;

# Verificar tablas
\dt

# Verificar datos
SELECT * FROM table_name LIMIT 10;
```

## 🚨 Errores Críticos

### **Error: products_list 500**
```bash
# Problema: Error 500 en lista de productos
# Investigación:
# 1. Verificar logs de Lambda
aws logs tail /aws/lambda/gamarriando-product-service-dev-products_list --follow

# 2. Verificar base de datos
# 3. Verificar conexión RDS
# 4. Verificar permisos

# Solución temporal:
# Usar endpoint de categorías que funciona
```

### **Error: Cold Start**
```bash
# Problema: Lambda cold start lento
# Solución:
# 1. Provisioned concurrency
# 2. Optimizar imports
# 3. Connection pooling
# 4. Warm-up functions
```

### **Error: Memory Issues**
```bash
# Problema: Out of memory en Lambda
# Solución:
# 1. Aumentar memoria en serverless.yml
memorySize: 512

# 2. Optimizar código
# 3. Reducir payload
# 4. Usar streaming
```

## 🔧 Herramientas de Debugging

### **AWS CLI**
```bash
# Verificar estado de servicios
aws lambda list-functions --profile personal
aws rds describe-db-instances --profile personal
aws s3 ls --profile personal
aws logs describe-log-groups --profile personal
```

### **Serverless Framework**
```bash
# Ver información de deployment
serverless info --stage dev

# Ver logs
serverless logs --function function-name --stage dev --tail

# Invocar función
serverless invoke --function function-name --stage dev
```

### **Docker**
```bash
# Debugging local con Docker
docker-compose up -d postgres
docker-compose logs -f postgres

# Entrar a contenedor
docker-compose exec postgres bash
```

## 📊 Monitoreo

### **Health Checks**
```bash
# Verificar frontend
curl -I http://gamarriando-web-dev.s3-website-us-east-1.amazonaws.com

# Verificar API
curl https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/health

# Verificar endpoints específicos
curl https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev/api/v1/categories
```

### **Métricas**
```bash
# Ver métricas de Lambda
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=function-name \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --profile personal
```

## 🆘 Obtener Ayuda

### **Logs y Información**
```bash
# Recopilar información para debugging
echo "=== System Info ==="
uname -a
node --version
npm --version
aws --version

echo "=== Git Status ==="
git status
git log --oneline -5

echo "=== Environment ==="
env | grep -E "(AWS|NODE|NPM)"

echo "=== Package Info ==="
npm list --depth=0
```

### **Contacto**
- **GitHub Issues**: [Crear issue](https://github.com/hugoangeles0810/trabajo-utec-cloud-computing/issues)
- **Email**: hugo.angeles@utec.edu.pe
- **Documentación**: [docs/](./README.md)

### **Recursos**
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)

## 📋 Checklist de Debugging

### **Antes de Reportar Issue**
- [ ] Verificar logs de CloudWatch
- [ ] Probar en entorno local
- [ ] Verificar configuración AWS
- [ ] Verificar variables de entorno
- [ ] Verificar permisos IAM
- [ ] Verificar conectividad de red
- [ ] Verificar base de datos
- [ ] Verificar código fuente

### **Información a Incluir**
- [ ] Descripción del problema
- [ ] Pasos para reproducir
- [ ] Logs relevantes
- [ ] Configuración del entorno
- [ ] Versiones de software
- [ ] Screenshots si aplica

---

**Guía de Troubleshooting** - Solución de Problemas Comunes 🔧
